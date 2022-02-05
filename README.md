This simple key-value wrapper evolved alongside my needs without losing original data:

1) lowdb (slow + ruins json file sometimes + I wanted to use key-value storage across different projects)
2) keyv with redis (parsing big keys was too slow)
3) node-redis wrapper (still using it, but might replace with real db with Multi-master Replication)
4) support for partial encryption
