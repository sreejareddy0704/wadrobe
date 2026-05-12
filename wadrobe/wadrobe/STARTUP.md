# Digital Closet - Startup Guide

To run the full application, you need to start three separate services.

## 1. AI Service (Python/FastAPI)
```bash
cd ai-service
# Make sure you have your OPENAI_API_KEY set in your environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 2. Backend Server (Node.js/Express)
```bash
cd server
cp .env.example .env # Add your Cloudinary and OpenAI credentials
npm install
npx prisma db push
npm run dev
```

## 3. Frontend Client (Next.js)
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.
The backend APIs are at `http://localhost:4000/api`.
The AI service is at `http://localhost:8000`.
