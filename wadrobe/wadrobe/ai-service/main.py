from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="Wardrobe AI Service")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ClothingItem(BaseModel):
    id: str
    category: str
    color: Optional[str] = None
    brand: Optional[str] = None
    occasion: Optional[str] = None
    season: Optional[str] = None
    tags: List[Dict] = []

class TaggingResponse(BaseModel):
    category: str
    color: str
    occasion: str
    season: str
    tags: List[Dict[str, str]]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "wardrobe-ai", "model": "gpt-4o"}

@app.post("/auto-tag", response_model=TaggingResponse)
async def auto_tag_item(image_url: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_key_here":
        return {
            "category": "TOP",
            "color": "white",
            "occasion": "CASUAL",
            "season": "SUMMER",
            "tags": ["minimal", "cotton", "breathable"]
        }

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert fashion stylist and computer vision assistant. Analyze garment images with extreme precision."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": "Identify this clothing item. Return JSON with: category (TOP, BOTTOM, FOOTWEAR, ACCESSORY, OUTERWEAR, ONE_PIECE), color, occasion (CASUAL, FORMAL, PARTY, WORK, TRAVEL, GYM), season (SPRING, SUMMER, FALL, WINTER, ALL_SEASON), and a list of 5 tags where each tag is an object like {'name': 'tag_text'}. Return ONLY JSON."
                        },
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image analysis")

@app.post("/generate-outfit")
async def generate_outfit(user_preferences: Dict, weather: str, occasion: str, items: List[ClothingItem]):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_key_here":
        return {
            "outfit": "Scandinavian Minimalist Set",
            "item_ids": [item.id for item in items[:2]] if items else [],
            "reasoning": "A clean, versatile look selected based on comfort and the current weather profile."
        }

    try:
        items_description = "\n".join([
            f"- ID: {item.id} | Category: {item.category} | Color: {item.color} | Brand: {item.brand} | Tags: {', '.join([t['name'] for t in item.tags])}" 
            for item in items
        ])
        
        system_prompt = "You are 'Astra', a luxury digital stylist known for sophisticated Scandinavian-inspired fashion. You create cohesive, stylish outfits from a user's closet."
        
        user_prompt = f"""
        Closet Inventory:
        {items_description}
        
        Constraints:
        - Occasion: {occasion}
        - Weather: {weather}
        - Personal Preferences: {user_preferences}
        
        Task: 
        Select 2-5 items from the closet that create a stunning, cohesive outfit for the given occasion and weather.
        
        Requirements:
        1. Return JSON only.
        2. 'outfit': A premium name for the look.
        3. 'item_ids': EXACT list of string IDs from the inventory above.
        4. 'reasoning': A short, expert explanation (2 sentences) of why this works.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        import json
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Error: {e}")
        raise HTTPException(status_code=500, detail="Styling engine failed to generate recommendation")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

