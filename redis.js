const Redis = require("ioredis");
const config = require("./config")

const configuration = {
    host: config.REDIS.REDIS_HOST,
    port: config.REDIS.REDIS_PORT,
    password: config.REDIS.REDIS_PASSWORD,
    timeout: 300,
    tls: {
        servername: config.REDIS.REDIS_HOST
    },
    // database: 0,
}

const connect = () => {
    return Redis.createClient(configuration);
}

const set = async (client, key, data, stringify = true) => {
    return await client.set(key, stringify ? JSON.stringify(data) : data);
}
const setex = async (client, key, data, expiresInSeconds = configuration.timeout, stringify = true) => {
    return await client.setex(key, expiresInSeconds, stringify ? JSON.stringify(data) : data);
}

const get = async (client, key, stringParse = true) => {
    const value = await client.get(key);
    return stringParse ? JSON.parse(value) : value;
}

const remove = async (client, key) => {
    return await client.del(key);
}

const disconnect = (client) => {
    client.disconnect();
}

module.exports = {
    connect,
    set,
    setex,
    get,
    remove,
    disconnect
}