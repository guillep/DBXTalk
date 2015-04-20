---
layout: post
title: DBXTalk Driver Phase Three - Querying a database
categories:
- Pharo
tags:
- bash
summary: This is the second post in a series about the new DBXTalk database driver.
status: publish
type: post
published: true
---

This is the third post in a series about the new DBXTalk database driver. 

##Statement Objects

Statement objects support fine-grain control over statements sent to a database. We can create a statement object by sending the *createMessage:* message to a connection object with a SQL statement string, or the *#createStatement* and then configuring the statement with the *statementString:* message.

{% highlight smalltalk %}
aStatement := connection createStatement: 'CREATE TABLE CATS (
	name varchar(50),
	owner varchar(50))'.

anotherStatement := connection createStatement.
anotherStatement statementString: 'SELECT * FROM CATS'.
{% endhighlight %}

Statement objects can be executed sending them the *execute* message. Executing a statement returns the same kind of results as using the *execute:* message from a connection object. In fact, the connection object uses a statement object underneath.

{% highlight smalltalk %}
result := aStatement execute.
result do: [ ... ].
{% endhighlight %}

Statement objects can be reused. We can send them multiple times the *execute* message and obtain our results multiple times. This is particularly useful to avoid statements with complex creations or already optimized by the database, as we will see in the following sections.

{% highlight smalltalk %}
result := aStatement execute.
result do: [ ... ].

"we can execute it again and obtain the same results"
aStatement execute do: [ ... ].
{% endhighlight %}


####Prepared Statements

Some statement objects can be *prepared*. A prepared statement is a statement that is sent to the database to pre-process it. The database server can pre-parse it, cache results or even the execution plan. Prepared statements show useful by reusing statements. A prepared statement can be prepared sending the *prepare:* message to a connection with a SQL statement string, or by sending the *prepare* message to an already existing statement.

{% highlight smalltalk %}
preparedStatement := connection prepare: 'SELECT * FROM CATS'.

anotherPreparedStatement := aStatement createStatement: 'SELECT * FROM CATS'.
anotherPreparedStatement prepare.
{% endhighlight %}

Although prepared statements benefits, they are not equally supported by every database nor driver. Different databases support the preparation of different kind of statements, and not all database drivers support prepared statements. On one side, when a database driver supports prepared statements, the statement is be sent to the database for its preparation immediately after the *prepare* message. If the sent statement cannot be prepared by the database, an exception will be thrown notifying it. On the other side, when a database driver does not support prepared statements, the statement will not be sent to the database nor fail. Indeed, it will continue to be an unprepared statement to provide a polymorphic interface to the user. We can send the message *supportsPreparedStatements* to a database connection to know if it supports prepared statements.

{% highlight smalltalk %}
aConnection supportsPreparedStatements
	ifTrue: [ ... ]
	ifFalse: [ ... ]
{% endhighlight %}

####Sanitizing SQL

Composing strings to create a SQL statement can be cumbersome but also an unsafe way of creating a query. Attackers may benefit from wrongly sanitized SQL to perform SQL injection: the injection of SQL attacks inside a query. For example, given the following query, we could be able to inject a DROP TABLE script if not correctly concatenated.

{% highlight SQL %}
SELECT * FROM TABLE WHERE name=<some param>
{% endhighlight %}

And get a SQL statement like this.

{% highlight SQL %}
SELECT * FROM CATS WHERE name='';DROP TABLE CATS;
{% endhighlight %}

Prepared statements provide means to safely insert parameters inside a SQL statement. These parameters or placeholders are denoted inside a query by different literals, depending on the database server. It is the work of the database and its driver to safely replace the placeholder by its correct value and handle the escaping of such code to avoid injection.

- Question mark placeholders (*?*) are positional placeholders. Their index is their order of appearance.
- Numbered placeholders are identified by a question mark or a dollar sign followed by an integer number (*?1*, *?2*, *$1*, *$2*). Their index is the number associated to them.
- Named placeholders are identified by a dollar sign, an at sign or a collon followed by an name number (*$name*, *@name*, *:name*). Their index is the number associated to them. Usually, two named placeholders with the same name need to be set only once as they denote the same value.

{% highlight SQL %}
SELECT * FROM TABLE WHERE name='?'
SELECT * FROM TABLE WHERE name='$1'
SELECT * FROM TABLE WHERE name=':name'
{% endhighlight %}

The DBXTalk driver, by pursuing a common interface between different database drivers, only proposes question mark placeholders (*?*) in a SQL statement.

A statement placeholders can be filled with arguments using the *bind:* message. The *bind:* message accepts as argument any Pharo object and will transform it accordingly to its database representation. If no bind is specified, it is responsability of the driver to decide what to do. For example, SQLite3 will interpret missing bindings as *NULL*.

{% highlight smalltalk %}
statement := connection prepare: 'SELECT * FROM CATS WHERE name='?''.
statement at: 1 bind: 'lutz'.
result := statement execute
{% endhighlight %}

If we try to do SQL injection using placeholder bindings, it will escape the argument creating a safe version of the SQL statement. In this case the injected code will be embedded inside a string and the query will execute safely.

{% highlight smalltalk %}
statement := connection prepare: 'SELECT * FROM CATS WHERE name='?''.
statement at: 1 bind: ''''';DROP TABLE TABLE;'.
result := statement execute.
{% endhighlight %}

{% highlight SQL %}
SELECT * FROM CATS WHERE name=''';DROP TABLE TABLE;'
{% endhighlight %}

A SQL statement can also contain many placeholders. In that case, the supplied bindings are set in order:

{% highlight smalltalk %}
statement := connection prepare: 'SELECT * FROM CATS WHERE name='?' OR owner='?''.
statement at: 1 bind: 'lutz'.
statement at: 2 bind: 'guille'.
result := statement execute.
{% endhighlight %}

{% highlight SQL %}
SELECT * FROM CATS WHERE name='''';DROP TABLE TABLE;
{% endhighlight %}

The placehoder bindings feature is, however, only supported from the database server and for prepared statements. For those drivers that do not include prepared statements, the DBXDriver provides with some escaping helpers. Escaping helpers try to sanitize locally the input parameters with a series of character escaping techniques. Note that local character escaping does not guarantee the safety of statement execution. They do indeed benefit from other complementary techniques such as input validation and correct database permission control.

####Statement Options

get auto generated keys

query timeout

####Next

TODO:
- table of what kind of statements can be prepared by database
- ask the database which kind of statements it supports for preparation
- maybe add an age to the cat to use only one example
- how to see the result description (column names and types)
- table of database types












