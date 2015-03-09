---
layout: post
title: DBXTalk Driver Phase One
categories:
- Pharo
tags:
- bash
summary: This is the first post in a series about the new DBXTalk database driver.
status: publish
type: post
published: true
---

This is the first post in a series about the new DBXTalk database driver.

##Getting a Connection


The new DBX database driver supports the creation of a connection through connection strings.

{% highlight smalltalk %}
connection := DBXDriver fromConnectionString: 'mysql://localhost:5432/sodbxtest?&user=sodbxtest&password=sodbxtest'.
{% endhighlight %}

Connection strings are URL styled:

* the schema (http, ftp, etc.) is the database driver id (we will talk about it in the next section). In this example our schema is mysql.
* host, port and database are the address of your database server
* the query-string allows us to put additional information such as connection credentials. the key *user* is followed by the database user to login and the key *password* by its password.

> driver://host:port/database?key=value&key2=value2



###Which are the drivers I have


When we try to create a database connection with an unexistent driver, we will have an exception declaring so.

{% highlight smalltalk %}
DBXDriver fromConnectionString: 'unexistent://localhost:3306/sodbxtest?user=sodbxtest&password=sodbxtest'
{% endhighlight %}

To know which are the available drivers you have, you can ask it to the driver class. The driver class will answer with the ids of the available drivers. Drivers are automatically subscribed to a driver manager when they are loaded.

{% highlight smalltalk %}
DBXDriver availableDrivers." => #(#mysql #opendbx #sqlite3 #postgresv2)"
{% endhighlight %}

You can also ask it if a particular driver is available by providing it a database driver id. Database driver ids are case insensitive for the driver. Internally, they are all described by lowercase symbols, and will be transformed by the driver accordingly to that format when you query it with ids.

{% highlight smalltalk %}
DBXDriver isAvailable: #mysql." => true"
DBXDriver isAvailable: #MySQl." => true"
{% endhighlight %}

###Stablishing connection

Initially and to avoid surprises, a database connection is not connected to the database. You can check if a connection is connected at any time during the life of the connection using the isConnected message.

{% highlight smalltalk %}
connection isConnected." => true/false"
{% endhighlight %}

To activate the connection, we can send the connect message to it. If everything is allright (the database is available, username and passwords are correct) we will receive no response. Instead, if a failure happened while trying to stablish the connection, we will receive an exception. Stablising manually the connection is useful to those users that want to parametrize the connection between its creation and its connection to the database. We will talk in more detail about connection settings in a following post.

{% highlight smalltalk %}
connection connect.
{% endhighlight %}

However, for those users that do not need to set manually parameters, he can use a shortcut that creates the connection and connects it in only one step.

{% highlight smalltalk %}
connection := DBXDriver connectToConnectionString: 'mysql://localhost:3306/sodbxtest?user=sodbxtest&password=sodbxtest'.
{% endhighlight %}

###Sending a Query

Once a connection is available, we can send queries and statements to it for its execution. Here we will only see a simple query, using the execute message. We will describe in details how queries and their results are managed in a next post.

{% highlight smalltalk %}
connection execute: 'CREATE TABLE CATS (
	name varchar(50),
	owner varchar(50))'.

connection execute: 'SELECT * FROM CATS'.
{% endhighlight %}

Executing a correct query will return an accoding result: a select query will answer a result with rows, other statements will return a result with a summary of the action they did (e.g., an insert or update will return the amount of modified rows). Executing a wrong query will throw an exception explaining the problem. For example, a query with incorrect syntax will fail and tell us where is the syntax problem; querying an unexistent table will throw an error saying so. We will dive later into the expected kind of results.


###Closing the connection

Database servers allow a limited number of simultaneous connections. If too many connections are open the server will start refusing new connections. To avoid these problems we have to close unused connections. Closing an unused connection will free used resources both in our Pharo image and in the database server. We can close manually a database connection by sending it the close message.

{% highlight smalltalk %}
connection close.
{% endhighlight %}

The DBXDriver provides also the automatic closure of connections on garbage collection. That is, when a database connection object is being garbage collected, the connection will be automatically closed. To allow a database connection to be automatically collected, we must release all references to it. We must not keep references to a connection from any of our objects.


###Next

* Different types of queries
* How to iterate results
* Different ways to access the results of a row














