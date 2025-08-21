Los siguientes son los endpoints creados desde el back para que funcione correctamente la aplicación. Esta separado por funcionalidades, pero igualmente verifica la información del front y con lo existentes en el back modifica e implementa la aplicación completamente.

ADMINISTRACION APIs de gestión administrativa para sesiones de votación
- /admin/sessions GET (Obtener sesiones de usuario)
Obtiene todas las sesiones de votación del administrador autenticado

[
  {
    "id": 1,
    "title": "Consulta sobre nuevo proyecto",
    "sessionCode": "ABC123",
    "sessionLink": "http://localhost:8080/vote/ABC123",
    "qrCodeData": "http://localhost:8080/vote/ABC123",
    "status": "ACTIVE",
    "questions": [
      {
        "id": 1,
        "questionText": "¿Cuál es tu color favorito?",
        "type": "MULTIPLE_CHOICE",
        "order": 1,
        "options": [
          {
            "id": 1,
            "optionText": "Azul",
            "order": 1,
            "voteCount": 25,
            "votePercentage": 65.5
          }
        ],
        "totalVotes": 42
      }
    ],
    "createdAt": "2025-08-19T05:23:54.802Z",
    "activatedAt": "2025-08-19T05:23:54.802Z",
    "closedAt": "2025-08-19T05:23:54.802Z"
  }
]

- /admin/sessions/{id} GET (Obtener sesiones por ID)
Obtiene una sesión de votación especifica por ID

{
  "id": 1,
  "title": "Consulta sobre nuevo proyecto",
  "sessionCode": "ABC123",
  "sessionLink": "http://localhost:8080/vote/ABC123",
  "qrCodeData": "http://localhost:8080/vote/ABC123",
  "status": "ACTIVE",
  "questions": [
    {
      "id": 1,
      "questionText": "¿Cuál es tu color favorito?",
      "type": "MULTIPLE_CHOICE",
      "order": 1,
      "options": [
        {
          "id": 1,
          "optionText": "Azul",
          "order": 1,
          "voteCount": 25,
          "votePercentage": 65.5
        }
      ],
      "totalVotes": 42
    }
  ],
  "createdAt": "2025-08-19T05:25:06.961Z",
  "activatedAt": "2025-08-19T05:25:06.961Z",
  "closedAt": "2025-08-19T05:25:06.961Z"
}

- /admin/sessions POST (Crear nueva sesión de votacion)
Crea un nueva sesión de votación con titulo y descripción

{
  "title": "Encuesta de Lenguajes de Programación",
  "description": "Sesión para conocer las preferencias de lenguajes de programación del equipo"
}

- /admin/sessions/{id}/close POST (Cerrar sesion)
Cierra una sesión de votación para dejar de aceptar votos

- /admin/sessions/{id}/actívate POST (Activar sesion)
Activa una sesión de votación para comenzar a aceptar votos

AUTENTICACION APIs de gestión de autenticación y registro de usuarios
- /auth/verify-registration POST Verify registration with code
Complete registration process by verifying the 6-digit code sent to email.

{
  "email": "usuario@ejemplo.com",
  "verificationCode": "123456"
}

- /auth/reset-password POST Reset password
Reset password using verification code.

{
  "email": "usuario@ejemplo.com",
  "verificationCode": "123456",
  "newPassword": "nuevacontraseña123",
  "confirmPassword": "nuevacontraseña123",
  "passwordsMatch": true
}

- /auth/resend-code POST Resend verification code
Resend verification code to email if the previous one is still valid.

{
  "additionalProp1": "string",
  "additionalProp2": "string",
  "additionalProp3": "string"
}

- /auth/register POST Registrar nuevo administrador
Registra una nueva cuenta de administrador. Envía código de verificación al email para confirmación.

{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "micontraseña123",
  "confirmPassword": "micontraseña123",
  "passwordsMatch": true
}

- /auth/login POST Autenticar administrador
Autentica un administrador con email y contraseña para obtener el token JWT. Valida todos los campos requeridos y asegura que solo los administradores puedan acceder.

{
  "email": "usuario@ejemplo.com",
  "password": "admin123"
}

- /auth/forgot-password POST Forgot password
Initiate password recovery process by sending verification code to email.

{
  "email": "usuario@ejemplo.com"
}

Preguntas
API para gestión de preguntas dentro de sesiones de votación

- /sessions/{sessionId}/questions/{questionId} DELETE Eliminar pregunta
Elimina una pregunta. No se puede eliminar si la sesión está activa o si ya tiene votos.

- /sessions/{sessionId}/questions/{questionId} GET Obtener detalle de una pregunta
Obtiene el detalle completo de una pregunta específica incluyendo opciones o respuestas de texto

{
  "id": 1,
  "questionText": "¿Cuál es tu color favorito?",
  "type": "MULTIPLE_CHOICE",
  "order": 1,
  "sessionId": 5,
  "options": [
    {
      "id": 1,
      "optionText": "Azul",
      "order": 1,
      "voteCount": 25,
      "votePercentage": 65.5
    }
  ],
  "totalVotes": 42,
  "textResponses": [
    {
      "response": "Mi respuesta es que prefiero el color azul",
      "submittedAt": "2025-08-19T05:43:04.471Z",
      "voterIdentifier": "usuario123"
    }
  ],
  "createdAt": "2025-08-19T05:43:04.471Z",
  "updatedAt": "2025-08-19T05:43:04.471Z"
}

- /sessions/{sessionId}/questions GET Obtener todas las preguntas de una sesión
Obtiene la lista de todas las preguntas de una sesión específica ordenadas por orden

{
  "id": 1,
  "questionText": "¿Cuál es tu color favorito?",
  "type": "MULTIPLE_CHOICE",
  "order": 1,
  "options": [
    {
      "id": 1,
      "optionText": "Azul",
      "order": 1,
      "voteCount": 25,
      "votePercentage": 65.5
    }
  ],
  "totalVotes": 42
}

- /sessions/{sessionId}/questions POST Crear nueva pregunta
Crea una nueva pregunta en la sesión especificada

{
  "questionText": "¿Cuál es tu lenguaje de programación favorito?",
  "type": "MULTIPLE_CHOICE",
  "order": 1,
  "options": [
    "Java",
    "Python",
    "JavaScript",
    "C#"
  ]
}

- /sessions/{sessionId}/questions/reorder POST Reordenar preguntas
Cambia el orden de las preguntas proporcionando una lista de IDs en el nuevo orden

[
  0
]

- /sessions/{sessionId}/questions/{questionId} PUT Actualizar pregunta
Actualiza una pregunta existente. No se puede modificar si la sesión está activa o si ya tiene votos

{
  "questionText": "¿Cuál es tu framework favorito?",
  "type": "MULTIPLE_CHOICE",
  "order": 2,
  "options": [
    "Spring Boot",
    "Django",
    "Express.js",
    "ASP.NET Core"
  ]
}


Votación
APIs públicas de votación para participantes

- /vote/{sessionCode} GET Obtener sesión de votación
Obtiene los detalles de la sesión de votación para participantes

{
  "id": 1,
  "title": "Consulta sobre nuevo proyecto",
  "sessionCode": "ABC123",
  "sessionLink": "http://localhost:8080/vote/ABC123",
  "qrCodeData": "http://localhost:8080/vote/ABC123",
  "status": "ACTIVE",
  "questions": [
    {
      "id": 1,
      "questionText": "¿Cuál es tu color favorito?",
      "type": "MULTIPLE_CHOICE",
      "order": 1,
      "options": [
        {
          "id": 1,
          "optionText": "Azul",
          "order": 1,
          "voteCount": 25,
          "votePercentage": 65.5
        }
      ],
      "totalVotes": 42
    }
  ],
  "createdAt": "2025-08-19T05:46:16.417Z",
  "activatedAt": "2025-08-19T05:46:16.417Z",
  "closedAt": "2025-08-19T05:46:16.417Z"
}

- /vote/{sessionCode}/question/{questionId} GET Obtener pregunta específica
Obtiene una pregunta específica de la sesión de votación para participantes

- /vote/{sessionCode} POST Enviar voto
Envía un voto para una pregunta específica en la sesión de votación

{
  "username": "Juan Pérez",
  "optionId": 1,
  "textResponse": "Mi respuesta es...",
  "voterFingerprint": "fingerprint123"
}

- /vote/{sessionCode}/questions/{questionId} POST Enviar voto para pregunta específica
Envía un voto o respuesta de texto para una pregunta específica

{
  "username": "Juan Pérez",
  "optionId": 1,
  "textResponse": "Mi respuesta es...",
  "voterFingerprint": "fingerprint123"
}