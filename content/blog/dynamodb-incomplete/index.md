---json
{
  "title": "DynamoDB And Incomplete Result Sets",
  "description": "A dive into an issue where results were not being returned by a query of a DynamoDB table and the results of the investigation.",
  "date": "2022-11-10",
  "hero_image": "./incomplete_hero.jpg",
  "tags": [
    "DynamoDB",
    "Software Engineering",
    "AWS",
    "Cloud Completing",
    "Postmortem"
  ]
}
---

In a recent project I worked on DynamoDB was used as the data store. The project was an internal utility that would get spiky utilization. It would go from zero traffic to a non-insignificant amount of usage in a short time. Combined with the almost zero operational overhead of managing a DynamoDB table and it was a solid choice as the data store for this tool.

### The Problem

After several months of usage, the users of the application would occasionally report that the "details" page of the tool would not populate with data. This was weird because the existence of the record was proven by its existence in the overview list but when navigating to the details page it acted like it didn't exist. Also, strangely, sometimes the system would fix itself.

## The Investigation

Upon digging into the issue we were able to confirm that the data for the details records did exist in the database. We also tracked down the exact query that was returning no data and ran the same query in the "Browse Table" functionality of the AWS console. When performed via the AWS console we were able to find the record without any issues. One of the first clues of what might be going on was when performing the query via the console it would take multiple seconds to complete. When performed via the application it would complete in single-digit milliseconds. Digging into this further we also noticed that this particular query was being performed via the [Scan API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html) while all the others were using the [Query API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html).

Those that have used DynamoDB may be seeing the issue here. The scan API is extremely easy to use coming from a relational world. You can simply request results and provide a filter expression and you are returned the results. Extremely comfortable for a SQL developer. Unfortunately, it is also an extremely inefficient way to query a DynamoDB table. One of the benefits of DynamoDB is that it can scale to extreme levels, "web-scale" as they call it. However, that only is only the case when you query it along its "fast path" which is not the Scan API. This is because the Scan API has to check each and every item in the table.

All of this indicates that if you have many items in your table it will take some time to scan through them all. This is what we were seeing with performing the query from the console. However, when performed via code it would return quickly but would return zero results. The reason for this wasn't immediately apparent. It was only after re-reading the documentation for the Scan API that the issue became apparent.

> If the total number of scanned items exceeds the maximum dataset size limit of 1 MB, the scan stops and results are returned to the user as a `LastEvaluatedKey` value to continue the scan in a subsequent operation. The results also include the number of items exceeding the limit. A scan can result in no table data meeting the filter criteria.

Sure enough, when we checked the results there was a `LastEvaluatedKey` value being returned. Even though we weren't returning any data we were scanning 1 MB of data to try to find the document. We didn't see this during development because the table had remained small and thus had stayed within the 1 MB limit for all queries. It also explains that the issue was seen off and on because sometimes the document would be found in the first megabyte of the table and sometimes it wouldn't based on where its object's key places it in the partition.

The solution to this issue was clear, if a `LastEvaluatedKey` value is returned and there are no results then query again and provide the `LastEvaluatedKey` as the `ExclusiveStartKey` value. The resulting code looked something like this:

```python
def get_copy(id, startKey=None):
    if startKey == None:
        response = dynamodb.scan(
            TableName=os.getenv('DATA_TABLE_NAME'),
            ConsistentRead=True,
            FilterExpression="id = :id",
            ExpressionAttributeValues={
                ':id': {
                    'S': id
                }
            }
        )
    else:
        response = dynamodb.scan(
            TableName=os.getenv('DATA_TABLE_NAME'),
            ConsistentRead=True,
            FilterExpression="id = :id",
            ExpressionAttributeValues={
                ':id': {
                    'S': id
                }
            },
            ExclusiveStartKey=startKey
        )
    if len(response['Items']) > 0 or not ('LastEvaluatedKey' in response.keys())
        return response['Items']
    else:
        return get_copy(copy_id, response['LastEvaluatedKey'])
```

This code takes advantage of the fact that we only expect to only ever find at most one document from the table so it can quit early if it finds a document that meets the criteria. Only after finding no results and being presented with no 'LastEvaluatedKey' does it determine that the data is not contained in the table.

Also of note, the Scan API is not the only API affected by this concern. The Query API can also run into this so be wary when using any Dynamo API to check for the 'LastEvaluatedKey' and act appropriately.

### The Correct Solution

For our particular case using the Scan API and looping through all the pages isn't actually the best solution. While this plugged the hole for the time being it is not the proper solution. Almost all uses of the Scan API that I have personally witnessed are code smells. They almost always indicate that there is more schema design that needs to happen. Whether this indicates restructuring keys for the table or adding [global secondary index(es)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) something likely should change. This is something that was a different experience for me when I first started working with DynamoDB. Before designing the schema of a DynamoDB table you need to consider all the query patterns that you will need to support. This is something that you can get away with not doing for some time when working with a SQL database.

### Conclusion

This experience was just one more example of the importance of reading the documentation and understanding the tools in use. Understand what they excel at and when you are using them in ways they weren't intended. A little more research at the beginning of this project could have prevented this issue.