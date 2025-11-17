# WhatsApp Business Webhook Service

A Node.js backend service to receive messages from WhatsApp Business API and save them to the filesystem as JSON files.

## Features

- ✅ Receive WhatsApp Business messages via webhook
- ✅ Save messages as JSON files with `messageFrom`, `message`, `datetime`, and `category`
- ✅ **Automatic message categorization** (BUYER, SELLER, TENANT, LANDLORD)
- ✅ Support for different message types (text, image, video, audio, etc.)
- ✅ Test endpoint for manual testing with Postman
- ✅ View all saved messages via API
- ✅ **Notifications endpoint** with categorized summaries and age indicators
- ✅ WhatsApp webhook verification
- ✅ CORS enabled for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3005`

### 3. Configuration (Optional)

You can set these environment variables:

- `PORT` - Server port (default: 3000)
- `VERIFY_TOKEN` - Token for WhatsApp webhook verification (default: my_secure_verify_token_123)
- `MESSAGES_DIR` - Directory to save messages (default: ./messages)

## API Endpoints

### 1. Health Check
```
GET /
```
Check if the server is running.

### 2. Webhook Verification (WhatsApp)
```
GET /webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE
```
Used by WhatsApp to verify your webhook URL.

### 3. Receive Messages (WhatsApp)
```
POST /webhook
```
Receives incoming messages from WhatsApp Business API.

### 4. Test Endpoint (For Manual Testing)
```
POST /webhook/test
```

**Request Body:**
```json
{
  "messageFrom": "+1234567890",
  "message": "Hello, this is a test message!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message saved successfully",
  "data": {
    "messageFrom": "+1234567890",
    "message": "Hello, this is a test message!",
    "datetime": "2025-11-10T12:34:56.789Z"
  }
}
```

### 5. Get Notifications (Categorized Messages)
```
GET /notifications
```

Returns categorized messages with age indicators and summary counts.

**Response:**
```json
{
  "total": 8,
  "summary": {
    "BUYER": 2,
    "SELLER": 2,
    "TENANT": 2,
    "LANDLORD": 1,
    "UNCATEGORIZED": 1
  },
  "notifications": [
    {
      "messageFrom": "+54911234567",
      "message": "Quiero comprar una casa",
      "datetime": "2025-11-09T10:30:00.000Z",
      "messageType": "text",
      "category": "BUYER",
      "isOld": false
    }
  ]
}
```

### 6. Get All Messages
```
GET /messages
```

**Response:**
```json
{
  "total": 2,
  "messages": [
    {
      "messageFrom": "+1234567890",
      "message": "Hello!",
      "datetime": "2025-11-10T12:34:56.789Z"
    }
  ]
}
```

## Testing with Postman

### Option 1: Simple Test Endpoint

1. **Create a POST request**
   - URL: `http://localhost:3000/webhook/test`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
   
2. **Add body (JSON):**
   ```json
   {
     "messageFrom": "+1234567890",
     "message": "Hello from Postman!"
   }
   ```

3. **Send the request**
   - You should get a success response
   - Check the `./messages` folder for a new JSON file

### Option 2: Simulate WhatsApp Webhook

1. **Create a POST request**
   - URL: `http://localhost:3000/webhook`
   - Method: `POST`
   - Headers: `Content-Type: application/json`

2. **Add body (WhatsApp format):**
   ```json
   {
     "object": "whatsapp_business_account",
     "entry": [
       {
         "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
         "changes": [
           {
             "value": {
               "messaging_product": "whatsapp",
               "metadata": {
                 "display_phone_number": "1234567890",
                 "phone_number_id": "PHONE_NUMBER_ID"
               },
               "contacts": [
                 {
                   "profile": {
                     "name": "John Doe"
                   },
                   "wa_id": "1234567890"
                 }
               ],
               "messages": [
                 {
                   "from": "1234567890",
                   "id": "wamid.XXX",
                   "timestamp": "1699632896",
                   "text": {
                     "body": "Hello from WhatsApp!"
                   },
                   "type": "text"
                 }
               ]
             },
             "field": "messages"
           }
         ]
       }
     ]
   }
   ```

3. **Send the request**
   - You should get `EVENT_RECEIVED` response
   - Check the `./messages` folder for a new JSON file

### Test Webhook Verification

1. **Create a GET request**
   - URL: `http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=test_challenge`
   - Method: `GET`

2. **Send the request**
   - You should get back the challenge string: `test_challenge`

## Message Storage Format

Messages are saved in the `./messages` directory as individual JSON files:

**Filename:** `message_1699632896789.json` (timestamp-based)

**Content:**
```json
{
  "messageFrom": "1234567890",
  "message": "Hello from WhatsApp!",
  "datetime": "2025-11-10T12:34:56.789Z",
  "messageType": "text",
  "messageId": "wamid.XXX",
  "category": "BUYER"
}
```

## Message Categorization

All incoming messages are automatically categorized based on their content:

### Categories:
- **BUYER** - Client wants to buy a property
- **SELLER** - Client wants to sell a property
- **TENANT** - Client wants to rent a property (as tenant)
- **LANDLORD** - Client wants to rent out a property (as owner)
- **UNCATEGORIZED** - Message doesn't match any category

### Detection Keywords:

**BUYER:**
- Spanish: comprar, compro, busco casa, busco propiedad, quiero comprar, interesado en comprar
- English: buyer, looking to buy, want to buy

**SELLER:**
- Spanish: vender, vendo, quiero vender, poner en venta
- English: selling, sell, want to sell, for sale

**TENANT:**
- Spanish: alquilar, alquilo, busco alquiler, busco en alquiler, quiero alquilar
- English: renting, rent, looking to rent, need to rent

**LANDLORD:**
- Spanish: alquilar propiedad, alquilar mi casa, tengo para alquilar, poner en alquiler, arrendar
- English: renting out, have property to rent

### Example Messages:

```json
// BUYER
{
  "messageFrom": "+54911234567",
  "message": "Hola, estoy buscando una propiedad para comprar en zona norte"
}

// SELLER
{
  "messageFrom": "+54911345678",
  "message": "Quiero vender mi departamento de 2 ambientes"
}

// TENANT
{
  "messageFrom": "+54911456789",
  "message": "Necesito alquilar un departamento de 3 ambientes"
}

// LANDLORD
{
  "messageFrom": "+54911567890",
  "message": "Tengo un local comercial para alquilar en el centro"
}
```

## Setting Up with WhatsApp Business API

1. **Get WhatsApp Business API access** through Meta for Developers
2. **Configure your webhook:**
   - Callback URL: `https://your-domain.com/webhook`
   - Verify Token: Set the same token in your environment variable
3. **Subscribe to message events**
4. **Deploy your service** to a server with HTTPS (required by WhatsApp)

### Recommended Deployment Options:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

## Project Structure

```
whatsapp-business-webhook/
├── server.js           # Main server file
├── package.json        # Dependencies
├── README.md          # This file
├── postman_collection.json  # Postman tests
└── messages/          # Saved messages (created automatically)
```

## Troubleshooting

### Messages not saving?
- Check that the `./messages` directory exists
- Check console logs for errors
- Verify the request format matches the expected structure

### Webhook verification failing?
- Ensure the `VERIFY_TOKEN` matches what you configured in WhatsApp
- Check the query parameters are correct

### Can't connect from WhatsApp?
- WhatsApp requires HTTPS - you need to deploy to a server with SSL
- For local testing, use tools like ngrok to create an HTTPS tunnel

## License

ISC

