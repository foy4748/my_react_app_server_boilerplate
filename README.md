# REACT APP SERVER BOILERPLATE  

## API documentation  

### Requesting JWT token
- Send GET request from Client at `/auth` end point.  
- The request headers should carry uid : uid of the firebase authenticated user.  
- The signed token will be sent as JSON response in "authtoken" property  

### Validate through "authGuard" middleware   
- To request protected API endpoints make sure  
    - Headers have "Content-Type":"application/json"  
    - Headers have authtoken : authtoken

### CRUD Test Endpoints
- `/test-post`
    - Stores the Request Body object after setting uid property va- `/test-delete`
    - Deletes single document by querying \_id. 
    - Headers should carry `"delete_id": _id` of the document

