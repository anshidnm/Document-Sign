
# Document Sign System

It is a document sign system made by django and JQuery.
    
## Installation

Run document sign system by follwing commands

```bash
  pip install -r requirements.txt
```
```bash
python manage.py migrate
```
```bash
  python manage.py runserver
```

## Notes
Currently PDF format only supported for signing

## Workflow (Localhost)

1. Go to localhost:8000/user/login/
2. Login or signup from there
3. In home page user can show his documents
4. User can filter documents with the select box present in home page
5. "From me" documents is the documents sent by authenticated user to other users
6. "To me" documents are the documents send by others to authenticated user to put signature
7. User can send documents to others by "Send document" button from home page
8. When click "Send document" button app will navigate to the page for manage signing area
9. In this page user can choose pages for signature and area for signature. user can controll area horizontally and vertically
10. To adjust the horizontal and vertical padding user need to enter the page number and
must click "Manage Sign Area" Button
10. After deciding the sign area user can send it to other users by entering their email
11. An email which added in receiver list for any document by others, when a user with that email signup and login in to this system then he can show documents that waiting for his sign, by using "To me" filter from home page
12. When a user click "view" button from list then he can sign on that document if he is a reciever of that
