---
layout: post
title: DBXTalk Driver Phase Two - Querying a database
categories:
- Pharo
tags:
- bash
summary: This is the second post in a series about the new DBXTalk database driver.
status: publish
type: post
published: true
---

This is the second post in a series about the new DBXTalk database driver.

##Executing queries

With the DBXTalk driver, the simplest way to execute a SQL query is by sending the message *execute:* to a connection object. The message *execute:* accepts **any** kind of statements, from SELECT and INSERT queries to CREATE TABLE or CREATE FOREIGN KEY statements.

{% highlight smalltalk %}
connection execute: 'CREATE TABLE CATS (
	name varchar(50),
	owner varchar(50))'.

connection execute: 'SELECT * FROM CATS'.
{% endhighlight %}

Using the *execute:* message, the driver will immediately sent the query to the database and interpret the results. If there is a syntax error in the query, the operation will fail with an exception indicating where such error was produced.


###Statement results

Executing a statements such as INSERT, UPDATE or CREATE TABLE do no return a set of rows as a result. Instead they only notify the amount of affected rows in the database. We can access the amount of affected rows of a result by sending it the *rowsAffected* message. However, the value returned by *rowsAffected* will vary between different database servers. For example, generally database servers return the amount of rows that result from the *WHERE* clause. However, MySQL does only count the rows whose values have really been changed. To know if a driver returns the number of really changed rows as affected rows, they understand the *affectsOnlyChangedRows* message.

{% highlight smalltalk %}
mysqlConnection affectsOnlyChangedRows. "=> true"
pgsqlConnection affectsOnlyChangedRows. "=> false"
{% endhighlight %}

In general, statements will return the following as affected rows:

* Data Definition Language (DDL) statements: DDL statements such as CREATE TABLE affect no rows. *rowsAffected* returns zero.

{% highlight smalltalk %}
result := connection execute: 'CREATE TABLE CATS (
	name varchar(50),
	owner varchar(50))'.

self assert: result affectedRows = 0.
{% endhighlight %}

* INSERT statement: An INSERT statement insert one row and thus, *rowsAffected* returns one.

{% highlight smalltalk %}
result := connection execute: 'INSERT INTO CATS(name, owner) VALUES (''lutz'', ''julien'')'.
self assert: result affectedRows = 1.

result := connection execute: 'INSERT INTO CATS(name, owner) VALUES (''inuk'', ''victor'')'.
self assert: result affectedRows = 1.
{% endhighlight %}

* DELETE and UPDATE statement: DELETE and UPDATE statements affect the rows that correspond to the WHERE clause, or all rows in the table if no WHERE clause is written. *rowsAffected* returns the amount of rows selected by the WHERE clause.

{% highlight smalltalk %}
result := connection execute: 'UPDATE FROM CATS SET owner=''guille'''.
self assert: result affectedRows = 2.

result := connection execute: 'DELETE FROM CATS WHERE name=''lutz'''.
self assert: result affectedRows = 1.
{% endhighlight %}


###Iterating Results

Differently from the statements we have already seen, SELECT statements return a set of rows as a result, namely a **result set**. A result set behaves almost as an sequenceable collection of rows. It provides, for example, the usual Pharo's iteration methods such as *do:*, *collect:* and *select:*. Notice that a normal SELECT statement executed through the *execute:* message will bring from the database all results at once. To focus in this post on how to iterate the results, we will postergate to a next post the optimization of row retrieval.

{% highlight smalltalk %}
result := connection execute: 'SELECT name AS catname, owner FROM CATS'.
result do: [ :row | ... ].
result select: [ :row | ... ].
result collect: [ :row | ... ].
{% endhighlight %}

Other helper methods allows us to access particular elements inside the result set. *first* returns the first row of the result set. *at:* returns the row at a particular index. In case there is no row in the demanded index, the message will fail with an exception. *isEmpty* tells if the result did not bring any rows from the database.

{% highlight smalltalk %}
result first.
result at: 1.
{% endhighlight %}

A result set can also be iterated as a cursor asking it for a *readStream*. Stream access to a result set is useful when we do not want to iterate the whole collection at once but instead defer the iteration in time. Using stream access the method *next* returns the element that follows in the stream while *next:* returns a collection with the following **N** rows where **N** is the number used as argument. *next:* will return at least the required amount of rows, except in the case where there are no more rows. When there are no more rows in the stream, *next* returns **nil** and *next:* returns an empty array.

{% highlight smalltalk %}
result := connection execute: 'SELECT name AS catname, owner FROM CATS'.
stream := result readStream.

(stream next: 10) do: [ :row | ... ].

[ next := stream next. next isNil ] whileFalse: [
   ...
]
{% endhighlight %}

Notice that a result set does not have a *size* method. This is made on purpose because we do not really know the size of the result in advance if the driver is accessing a result in a cursored way.

###Accessing Row Values

The data in rows is organized in columns. We can access the data inside a row either by the name of the column or the index of the column using respectively the *atName:* and *atIndex:* messages. However, notice that the column index and names are those specified in the query and not in the original table we are querying. For example, a query accessing only three columns from a table with four columns will only bring the three columnts we asked for. The order in which those columnts are retrieved is the order in which we asked for or the original order in the table if we didn't specify any. Also, if we put an alias into a column's name, we will only be able to access the column through the alias and not it's original name. 

{% highlight smalltalk %}
result := connection execute: 'SELECT name AS catname, owner FROM CATS'.
catRow := result rows first.

self assert: (catRow atName: 'catname') equals: 'lutz'.
self assert: (catRow atName: 'owner') equals: 'julien'.

self assert: (catRow atIndex: 1) equals: 'lutz'.
self assert: (catRow atIndex: 2) equals: 'julien'.
{% endhighlight %}


Notice that the results will be automatically transformed to Pharo objects by the driver. That is, if a column is of type *INTEGER*, the driver will transform it to a corresponding Pharo Integer. The same happens with other database types such as dates or times. However, these conversions depends on each of the databases and their corresponding driver.

{% highlight smalltalk %}
result := connection execute: 'SELECT COUNT(*) as count FROM CATS'.
row := result rows first.

self assert: (catRow atName: 'count') equals: 1.
{% endhighlight %}

For those that do not like accessing transformed data a row provides access to the raw values obtained from the database in form of strings. For that, there exist the messages *rawAtName:* and *rawAtIndex:*. Note that depending on the implementation on the driver, this raw value may be calculated. For example, SQLite as it is an FFI implementation or Mysql as it implements a binary protocol do not exchange pure strings with the database. To know if a driver provides directly raw elements, they understand the message *supportsRawAccess*.

{% highlight smalltalk %}
result := connection execute: 'SELECT COUNT(*) as count FROM CATS'.
row := result rows first.

self assert: (row rawAtIndex: 'count') equals: '1'.
self assert: (row rawAtName: 'count') equals: '1'.

connection supportsRawAccess." => if true raw values are directly available, if false they are converted by the driver when asked"
{% endhighlight %}

###Next

* prepared statements
* Sanitizing SQL











