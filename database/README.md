# Database Design

# 4/1/2026 First version by Kazuya

## 08-APR-26 Concept 
Alex
```
/* What I have so far for the database.*/
/* https://dbdiagram.io/d (was used for this) */

Table Auth {
  Auth_Name string [pk] // Primary Key
  Name_ string // Optional
}

Table Task {
  Task_ID string [pk]
  Task_Name string
  Task_Description string
}

// 
Table File_for_Tasks {
  file_name string
  file_url url
  file_placement string // So the file is put with the correct task either a task or file.
}

Table Tags_for_Tasks {
  tag_ID string [pk]
  tag_name string
}
//

Table Comment {
  Comment_ID string [pk]
  Task_ID string [ref: > Task.Task_ID]   // foreign key
  Actual_Comment_text string
}
```
<img width="776" height="548" alt="image" src="https://github.com/user-attachments/assets/503b1b4f-8646-4509-bb74-55f3699a7965" />
