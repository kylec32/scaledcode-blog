---
title: Applying the Composite Design Pattern
description: Using ElasticSearch and Jackson we explore the composite design pattern and how it can be useful in our development.
date: 2022-07-11
hero_image: ./composite-design-pattern-hero.jpg
tags:
  - design patterns
  - java
  - architecture
  - Clean Code
  - ElasticSearch
---

Software design patterns are [defined](https://en.wikipedia.org/wiki/Software_design_pattern) as "a general, reusable solution to a commonly occurring problem within a given context in software design." These patterns often will naturally come out as you develop and even without learning their names or learning about them directly people will often use these patterns. The benefits of learning the formal name and definitions of software design patterns are mainly two-fold. The first is that we can give ourselves a head start in applying these patterns and don't need to reinvent them ourselves. The second is that it gives us a common vocabulary with others in the industry. Rather than saying, "This class will only have one instance enforced by having a private constructor to avoid expensive construction costs" one could say, "This class is a singleton." If the person you are talking to doesn't know what a singleton is you will still have to describe it but if they do know what a singleton is there is no further explanation needed. Examples of commonly used design patterns are singletons, strategy pattern, builder, and the adapter pattern. These patterns are popular because they solve commonly recurring issues. Other patterns help in less common situations but are no less helpful when they come up. One of these is the composite pattern.

The composite pattern is a pattern in which you deal with a group of objects as if it was one object. This is accomplished by "composing" multiple instances into one hence the name "composite." This composed object represents a kind of tree structure where a client can treat each part the same way you can treat the whole. In this tree, there are both leaves and branches. To simplify interacting with these different types and to facilitate this pattern, both the branch and the leaves will implement the same interface. This interface usually exposes the least common denominator of behavior of the objects. It is the functionality that makes up the actions you can perform on the composite.

Each node in our tree is one of two different types. The first is a leaf node that strictly defines behavior. The next is a composite node that combines one (but often at least two) or more members of the composite. These can either be leaves or other composites. The tree could look something like:

{% image "./composite-tree-example.png", "Example Structure for a Composite." %}

You could also grab any node in that tree and treat it as its own entity and it would work (although it likely would have different behavior because it is composed of different parts).

### Composite Pattern Example

As a recent example of where this pattern is applicable, I recently was working on building a search API for a product. For this product, I was using [ElasticSearch](https://www.elastic.co/elasticsearch/) as the backend but didn't want to expose the ElasticSearch API directly because I wanted to implement certain access control functionality and have final authority over what search query is run on ElasticSearch. To enable this, we will use the composite pattern.

The ElasticSearch API provides a lot of very advanced behavior which we don't need to reimplement. Our goal is to provide a powerful, yet simple-to-use API. This API will provide both search operators such as "contains", "starts with", "is empty", etc. as well as operators to combine search operators such as "and", "or", and "not." Given that description you may be able to see how the search operators will serve as leaf nodes in the composite tree and the combining search operators will serve as the composite nodes.

Let's look at a few example queries. First a very basic one.

```json
{
    "field": "title",
    "operator": "CONTAINS",
    "value": "Mockingbird"
}
```

This is an extremely simple query that searches for items that have a title that contains the word "mockingbird." The composite graph would look like this:

{% image "./simplest-composite.png", "Composite graph of a simple query." %}

Let's look at something a little more complex.

```json
{
    "operator": "AND",
    "requests": [
        {
            "field": "keyword",
            "operator": "IS",
            "value": "fantasy"
        },
        {
            "field": "publication_date",
            "operator": "IS_AFTER",
            "value": "1930-01-01"
        },
        {
            "operator": "NOT",
            "requests": [
                {
                    "field": "title",
                    "operator": "CONTAINS",
                    "value": "Harry"
                }
            ]
        }
    ]
}
```

This query is asking for items that have the keyword of "fantasy", that was published after "1/1/1900", and whose title does not contain "Harry".

The composite graph for this would be:

{% image "./more-complex-graph.png", "Composite graph of more complex query" %}

Now we know what we want to build, let's build it. The first step is to come up with an interface that classes of the composite will implement. Thinking about what behavior we want from them we will have the interface require implementors to return a `Query` object from the [ElasticSearch Java Client(https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/introduction.html)] that defines the search operation it is performing.

```java
@JsonDeserialize(using = SearchRequestDeserializer.class)
public interface AbstractSearchRequest {
    @JsonIgnore
    Query getSerarch();
}
```

That is an extremely small interface to meet and half of the lines in the file are even Jackson annotations.

From here we can either directly implement this interface or, like in this example, implement a further class hierarchy to further simplify implementation. For example, we create a `TerminalSearchRequest` (terminal is used here instead of `Leaf` as used above).

```java
@Data
@EqualAndHashCode(callSuper = false)
@AllArgsConstructor
public abstract class TerminalSearchRequest implements AbstractSearchRequest {
    @Getter(value = AccessLevel.NONE)
    private String field;
    @Getter(value = AccessLevel.PROTECTED)
    private String value;

    protected String getField(SearchType searchType) {
        return FieldMapper.getFieldName(field, searchType)
                            .orElseThrow(() ->
                                new IllegalARgumentException(getQueryTypeName() + " search on field " + field + " is not supported"))
    }

    protected abstract String getQueryTypeName();
}
```

And a similar one for the composite side.

```java
@Data
@EqualAndHashCode(callSuper = false)
@AllArgsConstructor
public abstract class CompositeSearchRequest implements AbstractSearchRequest {
    @Getter(value = AccessLevel.PROTECTED)
    private List<AbstractSearchRequest> requests;
}
```

From that point, we can create implementations for each action we want to allow to be performed. For example, an "equals" operation could be implemented like:

```java
public class EqualsSearchRequest extends TerminalSearchRequest {
    public EqualsSearchRequest(String field, String value) {
        super(field, value);
    }

    @Override
    public Query getSearch() {
        return new Query(QueryBuilders.regexp()
                                        .field(getField(SearchType.KEYWORD))
                                        .value("\"" + getValue() + "\"")
                                        .build());
    }

    @Override
    public String getQueryTypeName() {
        return "Equals";
    }
}
```

We can also implement composite components.

```java
public class AndCompositeSearchRequest extends CompositeSearchRequest {
    public AndCompositeSearchRequest(List<AbstractSearchRequest> requests) {
        super(requests);
    }

    @Override
    public Query getSearch() {
        var boolBuilder = new BoolQuery.Builder();

        boolBuilder.must(getRequests().stream.map(AbstractSearchRequest::getSearch).toList());

        return new Query(boolBuilder.build());
    }
}
```

To the credit of the ElasticSearch client library, it facilitates using the composite pattern. This is largely because their API also follows a similar structure.

At this point we have the API contract defined and the Java code is written. We now need a way to convert from the JSON form to the Java object form. This is where Jackson comes in. Usually, Jackson does a fairly good job of simply taking a class and maybe with the help of a few annotations being able to convert to and from a JSON structure. In this case unfortunately we don't know what our structure is going to look like at compile time. Because of this, we get to use some lower-level parts of Jackson by implementing a `StdSerializer`. An explanation of how to implement one of those is beyond the scope of this article but you can see the [implementation](https://github.com/kylec32/search-api-example/blob/master/src/main/java/com/scaledcode/searchapi/searchrequest/SearchRequestDeserializer.java) details in the repository linked below.

The composite design pattern is a very interesting one in my opinion. When the situation fits, it can greatly simplify our code and allow it to be very flexible. As you work with libraries and APIs out in the wild you will likely start to recognize this pattern in the wild. This is another good tool to have in your tool belt.

You can see all the implementation details of the example here:

[https://github.com/kylec32/search-api-example](https://github.com/kylec32/search-api-example)
