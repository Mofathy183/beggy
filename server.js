import app from './app.js';
import { serverConfig } from './src/config/env.js';

// Application Listen
app.listen(serverConfig.port, () => {
	console.log(`Server is running on port ${serverConfig.port}`);
	console.log(`http://localhost:${serverConfig.port}`);
});

/**
 *[
    * {
        "firstName": "Mark",
        "lastName": "Rose",
        "email": "marker22r0@example.com",
        "password": "P@ssw0rd123",
        "confirmPassword": "P@ssw0rd123",
        "gender": "male",
        "birth": "1998-02-08",
        "country": "Span"
    },
    {
      "id": "033ef996-0739-473c-a7f8-1e86cb2a9ddc",
      "firstName": "Marwen",
      "lastName": "Sary",
      "email": "erza2@example.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "1998-02-08T00:00:00.000Z",
      "country": "Egypt",
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "486e90b8-e865-405d-8a9c-e69004f29cea",
      "firstName": "Stave",
      "lastName": "Pob",
      "email": "herrer2311@gmail.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": null,
      "birth": null,
      "country": null,
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "41acce96-da75-4ae4-a8c8-b282c827cd58",
      "firstName": "John",
      "lastName": "Don",
      "email": "jonahell222@example.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "2002-10-15T00:00:00.000Z",
      "country": "France",
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "d4d768fd-4457-4708-ac23-b3109987a4f2",
      "firstName": "Stave",
      "lastName": "Pob",
      "email": "poprose123@gmail.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "2004-07-29T00:00:00.000Z",
      "country": "USA",
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "622d0691-1d99-4ee4-8811-7b44f1fd6ab6",
      "firstName": "Jafe",
      "lastName": "Ron",
      "email": "fuckers111@example.com",
      "role": "admin",
      "profilePicture": "public/profilePicture.webp",
      "gender": null,
      "birth": null,
      "country": null,
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "ec33814e-5b3c-40cd-820d-89d5b0d4de25",
      "firstName": "John",
      "lastName": "Don",
      "email": "johnd0nw00@example.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "2002-10-15T00:00:00.000Z",
      "country": "France",
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "616a30bc-4afb-4f00-8bcd-228a2a8a9708",
      "firstName": "Mark",
      "lastName": "Rose",
      "email": "target@example.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "1998-02-08T00:00:00.000Z",
      "country": "Span",
      "suitcases": [],
      "bags": [],
      "items": []
    },
    {
      "id": "2f141a4d-4edd-4dbf-9c39-023373b8413c",
      "firstName": "Fransua",
      "lastName": "Sarry",
      "email": "funfun12@example.com",
      "role": "user",
      "profilePicture": "public/profilePicture.webp",
      "gender": "male",
      "birth": "2005-05-18T00:00:00.000Z",
      "country": "Itly",
      "suitcases": [],
      "bags": [],
      "items": []
    }
  ]
 **/
