import axios from "axios";
import { AIConfig } from "../config/env.js";
import { ErrorHandler } from "../utils/error.js";

const jsonRegExp = /```json\n([\s\S]+?)\n```/

export const itemAutoFilling = async (body) => {
    try {
        const { name, quantity, category } = body;

        if (!name || !quantity || !category) return new ErrorHandler(
            "input",
            "Missing required fields: name and quantity",
            "Missing required fields: name and quantity"
        )

        const prompt = `Estimate the total weight and volume for an item based on the following details:
        - **Item Name**: "${name}"
        - **Category**: "${category}" (e.g., electronics, clothing, tools, food, furniture)
        - **Quantity**: ${quantity} (number of units)

        ### Output Requirements:
        - **Weight**: The total weight for ${quantity} units in kilograms (kg).
        - **Volume**: The total space occupied by ${quantity} units in cubic meters (m³).

        ### Considerations:
        - If **category** is **electronics**, assume standard weights for common items like phones, laptops, or TVs.
        - If **category** is **clothing**, assume items can be compressed and reduce volume.
        - If **category** is **food**, consider density (e.g., fruits vs. canned goods).
        - If **category** is **furniture**, assume larger dimensions and higher weight.
        - If **category** is **tools**, assume a mix of heavy (metal) and lightweight (plastic) materials.
        - If **dimensions are unknown**, use industry-standard sizes for this item type.

        ### Output Format:
        Return only JSON with the following structure:
        \`\`\`json
        {
            "weight": 0.00,
            "volume": 0.00
        }
        \`\`\`
        Do not include any explanations.`;

        const response = await axios.post(
            AIConfig.url,
            {
                messages: [{ role: "user", content: prompt }],
                model: AIConfig.model,
            },
            {
                headers: AIConfig.headers,
            }
        );

        const output = response.data.choices[0].message.content;

        const jsonMatch = jsonRegExp.exec(output);

        if (!jsonMatch) return new ErrorHandler(
            "json",
            "Failed to extract JSON output from AI response",
            "Failed to extract JSON output from AI response"
        );

        const weight = Number(parseFloat(jsonMatch.weight).toFixed(2));
        const volume = Number(parseFloat(jsonMatch.volume).toFixed(2));

        if (isNaN(weight) || isNaN(volume)) return new ErrorHandler(
            "json",
            "Failed to parse JSON output from AI response",
            "Failed to parse JSON output from AI response"
        );

        return { volume: volume, weight: weight };
    }

    catch (error) {
        return new ErrorHandler(
            "axios",
            error,
            "Failed to fetch item details from AI API"
        );
    }
};


export const bagAutoFilling = async (body) => {
    try {
        const { name, type, size, material, feature } = body;

        if (!name ||!type ||!size ||!material ||!feature) return new ErrorHandler(
            "input",
            "Missing required fields: name, type, size, material, and feature",
            "Missing required fields: name, type, size, material, and feature"
        );

        const prompt = `Estimate the weight, maximum weight capacity, 
        and total volume (capacity) for a bag based on the following details:
            - Bag Name: "${name}"
            - Bag Type: "${type}" (e.g., backpack, suitcase, duffel, tote)
            - Bag Size: "${size}" (e.g., small, medium, large, or specific dimensions if available)
            - Bag Feature: "${feature}" (optional, e.g., wheels, reinforced straps, waterproof)
            - Material: "${material}" (e.g., leather, fabric, plastic, metal)

            ### Output Requirements:
            - **Weight**: The empty weight of the bag in kilograms (kg).
            - **MaxWeight**: The maximum weight capacity the bag can safely hold in kilograms (kg).
            - **Capacity**: The internal volume of the bag in cubic meters (m³).

            ### Considerations:
            - If **material** is heavy (e.g., leather, metal), increase bag weight.
            - If the **bag type** is a suitcase, assume a **structured frame** and higher weight.
            - If **bag features** include wheels, adjust the weight accordingly.
            - If **size** is provided in dimensions (e.g., 50x30x20 cm), calculate capacity accordingly.
            - If **size** is only a general term (e.g., "medium"), estimate based on standard industry values.

            ### Output Format:
            Return only JSON with the following structure:
            \`\`\`json
            {
            "weight": 0.00,
            "maxWeight": 0.00,
            "capacity": 0.00
            }
            \`\`\`
        Do not include any explanations.`;

        const response = await axios.post(
            AIConfig.url,
            {
                messages: [{ role: "user", content: prompt }],
                model: AIConfig.model,
            },
            {
                headers: AIConfig.headers,
            }
        );

        const output = response.data.choices[0].message.content;

        const jsonMatch = jsonRegExp.exec(output);

        if (!jsonMatch) return new ErrorHandler(
            "json",
            "Failed to extract JSON output from AI response",
            "Failed to extract JSON output from AI response"
        );

        const weight = Number(parseFloat(jsonMatch.weight).toFixed(2));
        const maxWeight = Number(parseFloat(jsonMatch.maxWeight).toFixed(2));
        const capacity = Number(parseFloat(jsonMatch.capacity).toFixed(2));

        if (isNaN(weight) || isNaN(maxWeight) || isNaN(capacity)) return new ErrorHandler(
            "json",
            "Failed to parse JSON output from AI response",
            "Failed to parse JSON output from AI response"
        );

        return { weight: weight, maxWeight: maxWeight, capacity: capacity };
    }

    catch (error) {
        return new ErrorHandler(
            "axios",
            error,
            "Failed to fetch bag details from AI API"
        );
    }
}


export const suitcaseAutoFilling = async (body) => {
    try {
        const { name, type, size, material, feature, brand, wheels } = body;

        if (!name ||!type ||!size) return new ErrorHandler(
            "input",
            "Missing required fields: name, type, and size",
            "Missing required fields: name, type, and size"
        );

        const prompt = `Estimate the suitcase's **capacity, maxWeight, and weight** based on the following details:
        - **Suitcase Name**: "${name}"
        - **Type**: "${type}" (e.g., carry-on, checked, duffel, hard-shell, soft-shell, backpack)
        - **Size**: "${size}" (e.g., small, medium, large, extra-large, 20-inch, 24-inch, 28-inch)
        - **Material** (optional): "${material}" (e.g., polycarbonate, aluminum, fabric, leather)
        - **Features** (optional): "${feature}" (e.g., expandable, waterproof, anti-theft, TSA lock)
        - **Brand** (optional): "${brand}" (e.g., Samsonite, American Tourister, Tumi, generic)
        - **Wheels** (optional): "${wheels}" (e.g., spinner, inline, no wheels)
        
        ### **Output Requirements**:
        - **Capacity**: The suitcase's internal capacity in liters (L).
        - **MaxWeight**: The maximum recommended weight the suitcase can carry in kilograms (kg).
        - **Weight**: The empty suitcase's own weight in kilograms (kg).
        
        ### **Considerations**:
        - **Carry-on suitcases** (20-inch) usually have **35-45L capacity**, **maxWeight of 10-15kg**, and **weigh around 2-3.5kg**.
        - **Checked suitcases** (24-inch, 28-inch) have **60-120L capacity**, **maxWeight of 20-30kg**, and **weigh around 3.5-6kg**.
        - **Hard-shell suitcases** (polycarbonate, aluminum) are **heavier but protect items better**.
        - **Soft-shell suitcases** (fabric, nylon) are **lighter and flexible but less durable**.
        - **Expandable models** have **increased capacity** by 10-15%.
        - **Wheels affect weight**: **4-spinner wheels** add extra weight compared to **inline or no wheels**.
        - **Premium brands** use lightweight materials, reducing weight compared to generic brands.
        
        ### **Output Format**:
        Return only JSON with the following structure:
        \`\`\`json
        {
        "capacity": 0.00,
        "maxWeight": 0.00,
        "weight": 0.00
        }
        \`\`\`
        Do not include any explanations.`;

        const response = await axios.post(
            AIConfig.url,
            {
                messages: [{ role: "user", content: prompt }],
                model: AIConfig.model,
            },
            {
                headers: AIConfig.headers,
            }
        );

        const output = response.data.choices[0].message.content;

        const jsonMatch = jsonRegExp.exec(output);

        if (!jsonMatch) return new ErrorHandler(
            "json",
            "Failed to extract JSON output from AI response",
            "Failed to extract JSON output from AI response"
        );

        const capacity = Number(parseFloat(jsonMatch.capacity).toFixed(2));
        const maxWeight = Number(parseFloat(jsonMatch.maxWeight).toFixed(2));
        const weight = Number(parseFloat(jsonMatch.weight).toFixed(2));

        if (isNaN(capacity) || isNaN(maxWeight) || isNaN(weight)) return new ErrorHandler(
            "json",
            "Failed to parse JSON output from AI response",
            "Failed to parse JSON output from AI response"
        );

        return { capacity: capacity, maxWeight: maxWeight, weight: weight };
    }

    catch (error) {
        return new ErrorHandler(
            "axios",
            error,
            "Failed to fetch suitcase details from AI API"
        );
    }
}