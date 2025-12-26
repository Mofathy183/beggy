const jsonRegExp = /```json\n([\s\S]+?)\n```/;

/**
 * @function itemAutoFilling
 * @description Automatically estimates the total weight and volume for an item based on its name, category, and quantity.
 * @param {Object} body - The input details of the item.
 * @param {string} body.name - The name of the item to estimate.
 * @param {number} body.quantity - The quantity of the item (number of units).
 * @param {string} body.category - The category of the item (e.g., electronics, clothing, tools, food, furniture).
 * @returns {Promise<Object>} An object containing the estimated weight (kg) and volume (m³), or an error if the operation fails.
 */
export const itemAutoFilling = async (body) => {
	try {
		const { name, quantity, category } = body;

		if (!name || !quantity || !category)
			return new ErrorHandler(
				'input',
				'Missing required fields: name and quantity and category',
				'Missing required fields: name and quantity and category',
				statusCode.badRequestCode
			);

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
				messages: [{ role: 'user', content: prompt }],
				model: AIConfig.model,
			},
			{
				headers: AIConfig.headers,
			}
		);

		const output = response.data.choices[0].message.content;

		if (!output) {
			return new ErrorHandler(
				'response',
				'Empty response from AI API',
				'AI API returned an empty response',
				statusCode.internalServerErrorCode
			);
		}

		const jsonMatch = jsonRegExp.exec(output);

		if (!jsonMatch)
			return new ErrorHandler(
				'json',
				'Failed to extract JSON output from AI response',
				'Failed to extract JSON output from AI response',
				statusCode.badRequestCode
			);

		let jsonParsed;
		try {
			jsonParsed = JSON.parse(jsonMatch[1].trim());
		} catch (err) {
			console.error('Failed to parse JSON output from AI response', err);
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);
		}

		const weight = Number(parseFloat(jsonParsed.weight).toFixed(2));
		const volume = Number(parseFloat(jsonParsed.volume).toFixed(2));

		if (isNaN(weight) || isNaN(volume))
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);

		return { volume: volume, weight: weight };
	} catch (error) {
		return new ErrorHandler(
			'axios',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Item Volume and Weight from AI'
				: error,
			'Failed to fetch item details from AI API',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function bagAutoFilling
 * @description Automatically estimates the weight, maximum weight capacity, and total volume (capacity) of a bag based on its name, type, size, material, and features.
 * @param {Object} body - The input details of the bag.
 * @param {string} body.name - The name of the bag to estimate.
 * @param {string} body.type - The type of the bag (e.g., backpack, suitcase, duffel, tote).
 * @param {string} body.size - The size of the bag (e.g., small, medium, large, or specific dimensions).
 * @param {string} body.material - The material of the bag (e.g., leather, fabric, plastic, metal).
 * @param {string} [body.feature] - Optional features of the bag (e.g., wheels, reinforced straps, waterproof).
 * @returns {Promise<Object>} An object containing the estimated weight (kg), maximum weight capacity (kg), and capacity (m³), or an error if the operation fails.
 */
export const bagAutoFilling = async (body) => {
	try {
		const { name, type, size, material, feature } = body;

		if (!name || !type || !size)
			return new ErrorHandler(
				'input',
				'Missing required fields: name, type, size, material, and feature',
				'Missing required fields: name, type, size, material, and feature',
				statusCode.badRequestCode
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
				messages: [{ role: 'user', content: prompt }],
				model: AIConfig.model,
			},
			{
				headers: AIConfig.headers,
			}
		);

		const output = response.data.choices[0].message.content;

		if (!output) {
			return new ErrorHandler(
				'response',
				'Empty response from AI API',
				'AI API returned an empty response',
				statusCode.internalServerErrorCode
			);
		}

		const jsonMatch = jsonRegExp.exec(output);

		if (!jsonMatch)
			return new ErrorHandler(
				'json',
				'Failed to extract JSON output from AI response',
				'Failed to extract JSON output from AI response',
				statusCode.badRequestCode
			);

		let jsonParsed;
		try {
			jsonParsed = JSON.parse(jsonMatch[1].trim());
		} catch (err) {
			console.error('Failed to parse JSON output from AI response', err);
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);
		}

		const weight = Number(parseFloat(jsonParsed.weight).toFixed(2));
		const maxWeight = Number(parseFloat(jsonParsed.maxWeight).toFixed(2));
		const capacity = Number(parseFloat(jsonParsed.capacity).toFixed(2));

		if (isNaN(weight) || isNaN(maxWeight) || isNaN(capacity))
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);

		return { weight: weight, maxWeight: maxWeight, capacity: capacity };
	} catch (error) {
		return new ErrorHandler(
			'axios',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Bag Weight, Capacity and Max Weight from AI'
				: error,
			'Failed to fetch bag details from AI API',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function suitcaseAutoFilling
 * @description Automatically estimates the capacity, maximum weight capacity, and empty weight of a suitcase based on its name, type, size, material, features, brand, and wheels.
 * @param {Object} body - The input details of the suitcase.
 * @param {string} body.name - The name of the suitcase to estimate.
 * @param {string} body.type - The type of the suitcase (e.g., carry-on, checked, duffel, hard-shell, soft-shell, backpack).
 * @param {string} body.size - The size of the suitcase (e.g., small, medium, large, extra-large, or specific dimensions like 20-inch).
 * @param {string} [body.material] - The material of the suitcase (optional, e.g., polycarbonate, aluminum, fabric, leather).
 * @param {string} [body.feature] - Optional features of the suitcase (e.g., expandable, waterproof, anti-theft, TSA lock).
 * @param {string} [body.brand] - The brand of the suitcase (optional, e.g., Samsonite, American Tourister, Tumi, generic).
 * @param {string} [body.wheels] - The type of wheels on the suitcase (optional, e.g., spinner, inline, no wheels).
 * @returns {Promise<Object>} An object containing the estimated capacity (L), maximum weight capacity (kg), and empty weight (kg), or an error if the operation fails.
 */
export const suitcaseAutoFilling = async (body) => {
	try {
		const { name, type, size, material, feature, brand, wheels } = body;

		if (!name || !type || !size)
			return new ErrorHandler(
				'input',
				'Missing required fields: name, type, and size',
				'Missing required fields: name, type, and size',
				statusCode.badRequestCode
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
				messages: [{ role: 'user', content: prompt }],
				model: AIConfig.model,
			},
			{
				headers: AIConfig.headers,
			}
		);

		const output = response.data.choices[0].message.content;

		if (!output) {
			return new ErrorHandler(
				'response',
				'Empty response from AI API',
				'AI API returned an empty response',
				statusCode.internalServerErrorCode
			);
		}

		const jsonMatch = jsonRegExp.exec(output);

		if (!jsonMatch)
			return new ErrorHandler(
				'json',
				'Failed to extract JSON output from AI response',
				'Failed to extract JSON output from AI response',
				statusCode.badRequestCode
			);

		let jsonParsed;
		try {
			jsonParsed = JSON.parse(jsonMatch[1].trim());
		} catch (err) {
			console.error('Failed to parse JSON output from AI response', err);
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);
		}

		const capacity = Number(parseFloat(jsonParsed.capacity).toFixed(2));
		const maxWeight = Number(parseFloat(jsonParsed.maxWeight).toFixed(2));
		const weight = Number(parseFloat(jsonParsed.weight).toFixed(2));

		if (isNaN(capacity) || isNaN(maxWeight) || isNaN(weight))
			return new ErrorHandler(
				'json',
				'Failed to parse JSON output from AI response',
				'Failed to parse JSON output from AI response',
				statusCode.badRequestCode
			);

		return { capacity: capacity, maxWeight: maxWeight, weight: weight };
	} catch (error) {
		return new ErrorHandler(
			'axios',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Suitcase Weight, Capacity and Max Weight from AI'
				: error,
			'Failed to fetch suitcase details from AI API',
			statusCode.badRequestCode
		);
	}
};
