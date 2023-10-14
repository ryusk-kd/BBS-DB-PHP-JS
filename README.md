# BBS-DB-PHP-JS

Bulletin Board System (BBS) that uses a database, PHP, and JavaScript.

## Page Structure

- Topic List Page (index.html)
- Topic Page (topic/index.html)
- Account Page (account/index.html)

## Database Data Structure

Create four tables: users, topics, posts, and login_tokens.

### users

| Field | Type | Null | Key | Default | Extra |
| ----- | ---- | ---- | --- | ------- | ----- |
| date | timestamp | NO | | current_timestamp() | on update current_timestamp() |
| username | char(24) | NO | PRI | NULL |
| pwd_hash | varchar(255) | YES | | NULL | |

### topics

| Field | Type | Null | Key | Default | Extra |
| ---- | ---- | ---- | ---- | ---- | ---- |
| topic_id | int(11) | NO | PRI | NULL | auto_increment |
| title | varchar(100) | NO | | NULL | |
| created_at | timestamp | NO | | current_timestamp() | on update current_timestamp() |
| content | text | NO | | NULL | |

### posts

| Field | Type | Null | Key | Default | Extra |
| ---- | ---- | ---- | ---- | ---- | ----- |
| post_id | int(11) | NO | PRI | NULL | auto_increment |
| topic_id | int(11) | NO | MUL | NULL | |
| content | text | NO | | NULL | |
| created_at | timestamp | NO | | current_timestamp() | on update current_timestamp() |
| username | varchar(24) | YES | MUL | NULL | |

### login_tokens

| Field | Type | Null | Key | Default | Extra |
| ---- | ---- | ---- | ---- | ---- | ---- |
| token | varchar(255) | NO | PRI | NULL | |
| username | varchar(24) | NO | | NULL | |
| created_at | timestamp | NO | | current_timestamp() | |
