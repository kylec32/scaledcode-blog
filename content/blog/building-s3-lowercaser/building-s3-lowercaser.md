---
title: Building an S3 Lowercaser
description: Leveraging S3 event notifications and AWS Lambda to automatically lower case all object keys in a bucket
date: 2021-05-18
hero_image: ./s3-lower-caser.jpg
tags:
  - serverless
  - software development
  - AWS Lambda
  - architecture
  - S3
---

AWS Lambda and other serverless compute options give technologists a great option to avoid having to think about the provisioning of servers, scaling, and many parts of the operational overhead of running complex systems. Recently I had the opportunity to take advantage of this power when presented with a tricky problem. The solution for us ended up being building a serverless S3 object key lowercaser.

## Why Build This Tool?

The problem we were faced with was the migration of the storage for a product from SMB shares hosted on Amazon EBS volumes to S3 object storage. This transition was anything but simple with many complexities but the challenge that is relevant to this discussion is that SMB exposes a case insensitive file system and S3 is a case-sensitive object store; thus, simply converting files to objects would not work if the casing wasn't consistent. Given the application that was using the files is around 20 years old with over a million lines of code, confidence was low that the files would all be in a consistent case. Because of this the decision was made to convert all filenames to lowercase before storage. This effectively allowed us to ignore this issue. The issue to be solved though was how to effectively convert millions of file names to lowercase.

## An Initial Failure

We initially wrote a lot of tooling to try to make this easier. This tooling was a multi-step process where we would lowercase all the files locally and then use the AWS CLI to run an S3 sync task to get the data up to the necessary buckets. This process did work but was slow and error prone as we would have to follow up the copy with another final sync to true up during final downtime as the cutover happened. After running through this process a few times on some test environments we determined this process was not going to work.

## A Change of Direction

After our initial failure we decided to go back to the drawing board and see if splitting up the process into individual pieces could improve our process. Knowing that the first part of our process, that of copying the data up to the S3 bucket, was not a unique need we were sure there had to be a well built tool out there to facilitate that process. We found AWS's DataSync tool that "simplifies, automates, and accelerates moving data between on-premises storage systems and AWS Storage services" according to it's documentation. We found this to be true to its description. After installing the DataSync agent we ran some test copies and were extremely pleased with the mirror speed as well as the visibility in the copy process. This was much better than our home grown tooling in basically every way.

At this point we had solved our data migration issue but still didn't have a solution to the lowercasing issue. When we were trying to figure out our initial solution we had considered lowercasing the objects after they were in S3. This idea was thrown out since there is no rename object key function in S3, instead you must copy the object then delete the original. This seemed extremely slow and would require a vast amount of API calls. Taking this idea out of the garbage can we decided to take another look at it but run it slightly different.

## The Lambda Lowercaser

The architecture we decided to move to looked something like the following:

{% image "./simpleLowerCaserArchitecture.png", "S3 lowercaser architecture. S3 bucket leads to lambda function with failed items going to SQS." %}

The high level architecture was to set up [S3 event notifications](https://medium.com/r/?url=https%3A%2F%2Fdocs.aws.amazon.com%2FAmazonS3%2Flatest%2Fuserguide%2FNotificationHowTo.html) on the target buckets to trigger a Lambda function. That Lambda function would then determine if the object key was already lowercase, if it was this is where the function would end, if not it would lowercase the object. Finally, if there was an error during the process, failure information would be dropped on a long retention SQS queue.

Let's dig into the code a little bit more. Let's start with the infrastructure-as-code pieces. When working with a Lambda-based architecture I like to use the Serverless framework as I think it makes things rather easy and it largely stays out of your way.

```yaml
service: s3objectlowercaser

provider:
  name: aws
  runtime: python3.8
  region: us-west-2
  environment:
    FAILURE_QUEUE_NAME:
      Fn::GetAtt:
        - FailedLowerCasingObject
        - QueueName
  iamRoleStatements:
    - Effect: "Allow"
      Action:
        - "sqs:GetQueueUrl"
        - "sqs:SendMessage"
      Resource:
        Fn::GetAtt:
          - FailedLowerCasingObject
          - Arn
    - Effect: "Allow"
      Action:
        - "s3:GetObject"
        - "s3:PutObject"
        - "s3:DeleteObjectVersion"
        - "s3:GetObjectTagging"
        - "s3:PutObjectTagging"
      Resource: 
        - "arn:aws:s3:::lowercaseitalltester/*"

functions:
  lowercaser:
    handler: handler.lambda_handler
    timeout: 600

resources:
  Resources:
    FailedLowerCasingObject:
      Type: "AWS::SQS::Queue"
      Properties:
        QueueName: FailedLowerCasingObjects
        VisibilityTimeout: 30
        KmsMasterKeyId: "alias/aws/sqs"
        MessageRetentionPeriod: 1209600
```

Notable pieces of information in this configuration.

* In the `resources` section we create the SQS queue for the failed lowercasing attempts to be logged to. Probably the most interesting part of this is the `MessageRetentionPeriod` of 1209600 seconds (14 days) which is the max available value for this field. Because humans will be reviewing the results from this queue, we want to give them as much time as possible.
* Using the `iamRoleStatements` section we are able to create a least privilege policy for the Lambda to run under that allows only the access necessary to get the job done.
* Line 29 lists the resources that the function is allowed to operate on, this of course would need to be changed for each use case.

Now it’s time to look at some code. There is not a lot of code for this function but there are some gotchas to watch out for.

```python

def lambda_handler(event, context):
    for record in event['Records']:
        try:
            bucket_name = record['s3']['bucket']['name']
            object_name = record['s3']['object']['key']
            object_size = record['s3']['object']['size']
            version_id = record['s3']['object']['versionId']

            # Key's come HTML encoded, we need to remove that. 
            object_name = urllib.parse.unquote_plus(object_name)
            lower_case_object_name = object_name.lower()
            if lower_case_object_name != object_name:
                print("Current object is not of the correct case (" + bucket_name + " / " + object_name +")")

                # If over ~ 5 GB copy with alternative method
                if object_size > 5368709100:
                    copy_large_object(bucket_name, object_name, lower_case_object_name)
                else:
                    copy_object(bucket_name, object_name, lower_case_object_name)
                delete_object_entirely(object_name, version_id, bucket_name)
            else:
                print("Already in the right case: (" + bucket_name + " / " + lower_case_object_name +")")
        except Exception as e:
            send_failed_object(record, e)
            raise
        
    return
```

S3 event notifications come in as arrays of objects that have been changed so on line 2 we simply loop through all the objects provided. We then pull the necessary information out of the JSON object provided.

On line 10 we hit our first gotcha, the event notification HTML encodes the object name for some reason. Potentially if your object names don’t contain any special characters this may not come into play but better to be safe than sorry.

Next we check if the lowercase version of the object name is the same as the current object name, that is, we determine if the object needs to be lowercased. This part is very important, the reason being that if you didn’t do this you would end up with an infinite loop of Lambda calls. An object would come in, the file would be lowercased and written to the bucket, this would then trigger another call to the lambda thus starting the vicious cycle. When setting up S3 event notifications there is literally a warning about not doing this.

Line 16 gets into the next potential gotcha. When working with files over 5 GBs the function you have to use to make the copy is different and less efficient (therefore you don’t want to always use it), if you try to use the original method it [will fail](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.copy_object).

Outside of that the code ends up being fairly straightforward. We do our copy and then delete the original file, if anything throws an error throughout the process we send the stack trace to SQS.

## How Did It Work?

It ended up working quite well. Having built on top of the scalability of Lambda we were able to handle as many objects as we could throw in the buckets. We also didn’t have to wait for all objects to be copied into the bucket before starting the process (we actually had to do the opposite, it had to be set up before the upload happened). The guarantees of S3 event notifications is at least once delivery, this guarantee is perfect for our use case. It turns out with the realtime renaming happening we didn’t really suffer much with the inefficient copies, it of course did result in more API calls which meant increased costs but those increases were trivial and well worth it.

## Lessons Learned
* Look for existing solutions before building your own.
* Building on top of existing scalable solutions can simplify your life greatly.
* Become familiar with lots of different technologies, you never know when you will be able to use the technology to solve the problem.

## Resources

[Repository](https://github.com/kylec32/s3lowercaser)

[S3 Event Notification Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html)

[AWS DataSync](https://aws.amazon.com/datasync)

