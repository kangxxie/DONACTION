// test-debug-endpoints.js
const axios = require("axios");

const API_URL = "http://localhost:8080/api/debug";
const CAMPAIGN_ID = 1; // Cambia con un ID di campagna valido nel tuo database

async function testDebugEndpoints() {
  try {
    // 1. Test the campaigns list endpoint
    console.log("\n==== Fetching all campaigns ====");
    const campaignsResponse = await axios.get(`${API_URL}/campaigns`);
    console.log(`Found ${campaignsResponse.data.campaigns.length} campaigns`);

    if (campaignsResponse.data.campaigns.length > 0) {
      const firstCampaign = campaignsResponse.data.campaigns[0];
      console.log("First campaign:", {
        id: firstCampaign.id,
        title: firstCampaign.title,
        category: firstCampaign.category,
      });
    }

    // 2. Test the specific campaign endpoint
    console.log(`\n==== Fetching campaign with ID ${CAMPAIGN_ID} ====`);
    try {
      const campaignResponse = await axios.get(
        `${API_URL}/campaign/${CAMPAIGN_ID}`
      );
      console.log("Campaign details:", campaignResponse.data.campaign);

      // 3. Try to update this campaign
      const campaign = campaignResponse.data.campaign;

      const updateData = {
        title: `${campaign.title} (Updated test)`,
        description: campaign.description,
        goal: campaign.goal,
        imageUrl: campaign.imageUrl,
        category: campaign.category,
      };

      console.log(`\n==== Updating campaign with ID ${CAMPAIGN_ID} ====`);
      console.log("Update data:", updateData);

      const updateResponse = await axios.post(
        `${API_URL}/update-campaign/${CAMPAIGN_ID}`,
        updateData
      );
      console.log("Update response:", updateResponse.data);

      // 4. Verify the update
      const verifyResponse = await axios.get(
        `${API_URL}/campaign/${CAMPAIGN_ID}`
      );
      console.log("\n==== Verifying update ====");
      console.log("Updated campaign:", verifyResponse.data.campaign);

      if (verifyResponse.data.campaign.title === updateData.title) {
        console.log("\n Update successful!");
      } else {
        console.log("\n Update failed - title did not change");
        console.log("Expected:", updateData.title);
        console.log("Got:", verifyResponse.data.campaign.title);
      }
    } catch (error) {
      console.error(`Error with campaign ID ${CAMPAIGN_ID}:`, error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
    }
  } catch (error) {
    console.error("Error in test script:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testDebugEndpoints();
