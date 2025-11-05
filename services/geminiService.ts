import { GoogleGenAI } from "@google/genai";
import { Venue } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a detailed context string from a Venue object.
 * @param venue The venue data.
 * @returns A string formatted for the AI prompt.
 */
function createVenueContext(venue: Venue): string {
    const context = `
        Restaurant Name: ${venue.name}
        Address: ${venue.address}, ${venue.district}
        Capacity: from ${venue.capacity_min} to ${venue.capacity_max} people.
        Base Rental Fee: ${venue.base_rental_fee_azn} AZN.
        
        Policies:
        - Price per person: from ${venue.policies.price_per_person_azn_from} to ${venue.policies.price_per_person_azn_to} AZN.
        - Alcohol allowed: ${venue.policies.alcohol_allowed ? 'Yes' : 'No'}.
        - Corkage fee: ${venue.policies.corkage_fee_azn} AZN.
        - Outside catering allowed: ${venue.policies.outside_catering_allowed ? 'Yes' : 'No'}.

        Cuisine: ${venue.cuisine.join(', ')}.
        Facilities: ${venue.facilities.join(', ')}.
        Services: ${venue.services.join(', ')}.
        Suitable for: ${venue.suitable_for.join(', ')}.

        Contact Person: ${venue.contact.person}
        Contact Phone: ${venue.contact.phone}
        Contact Email: ${venue.contact.email}
    `;
    return context.trim();
}

/**
 * Sends a prompt to the Gemini API with venue context.
 * @param userPrompt The user's question.
 * @param venue The currently selected venue.
 * @returns The AI's response as a string.
 */
export const getAiAssistance = async (userPrompt: string, venue: Venue): Promise<string> => {
    try {
        const venueContext = createVenueContext(venue);
        const fullPrompt = `
            Based on the following information about a restaurant, answer the user's question.
            Keep your answer concise and helpful.

            Restaurant Information:
            ${venueContext}

            User's Question: "${userPrompt}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: "You are a helpful assistant for an event management CRM. You provide clear and concise information about venues based on the data provided.",
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error while trying to get an answer. Please try again later.";
    }
};