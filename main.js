/**
 * Created by E on 23.5.2016.
 */


var channel = process.env.channel;
var rabbitmq_host = process.env.rabbitmq_host;

var irc_server = process.env.irc_server;
var irc_user = process.env.irc_user;

/* Twitch */

var irc = require('irc');
var client = new irc.Client('irc.yourserver.com', 'myNick', {
    channels: ['#' + channel]
});

/* RabbitMQ */

var rabbitmq_ch;
var exchange = "amqp.irc." + channel;

var amqp = require("amqplib/callback_api");
amqp.connect("amqp://" + rabbitmq_host, function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertExchange(exchange, "fanout", {durable: false});
        rabbitmq_ch = ch;
    })
});

/* Connector */


client.addListener('message', function (from, to, message) {
    var time = Date.now();
    var object = {
        type: "messsage",
        channel: to,
        user: from,
        message: message,
        time: time
    };
    if(rabbitmq_ch) {
        rabbitmq_ch.publish(exchange, "", new Buffer(JSON.stringify(object)));
    }
});