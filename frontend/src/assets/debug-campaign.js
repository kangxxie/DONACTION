// Console debug script for campaign updates
// To use this script, copy and paste it into your browser console when on the campaign edit page

(function() {
  console.log('Running DONACTION Campaign Debug Script');
  
  // Get the current auth token
  function getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('Auth token found:', !!token);
    return token;
  }
  
  // Test direct API call to update campaign
  async function testUpdateCampaign(campaignId, updateData) {
    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token found. Please log in first.');
      return;
    }
    
    try {
      const apiUrl = 'http://localhost:8080/api/campaigns';
      console.log(`Making direct API call to ${apiUrl}/${campaignId}`);
      
      const response = await fetch(`${apiUrl}/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Campaign updated successfully!', data);
      } else {
        console.error('❌ Campaign update failed:', data);
      }
      
      return { success: response.ok, data };
    } catch (error) {
      console.error('❌ Error making API call:', error);
      return { success: false, error };
    }
  }
  
  // Get campaign form data
  function getFormData() {
    // Try to find Angular's component instance
    try {
      const componentInstance = ng.getComponent(document.querySelector('app-campaign-form'));
      if (componentInstance && componentInstance.campaign) {
        console.log('Found Angular component with campaign data:', componentInstance.campaign);
        return componentInstance.campaign;
      }
    } catch (e) {
      console.log('Could not access Angular component:', e);
    }
    
    // Manual extraction as fallback
    const title = document.querySelector('#title')?.value;
    const description = document.querySelector('#description')?.value;
    const goal = Number(document.querySelector('#goal')?.value);
    const category = document.querySelector('#category')?.value;
    const imageUrl = document.querySelector('#imageUrl')?.value;
    
    const formData = { title, description, goal, category, imageUrl };
    console.log('Extracted form data:', formData);
    return formData;
  }
  
  // Get campaign ID from URL
  function getCampaignIdFromUrl() {
    const url = window.location.href;
    const match = url.match(/\/campaigns\/edit\/(\d+)/);
    return match ? match[1] : null;
  }
  
  // Define our debug methods
  window.debugCampaign = {
    getToken: getAuthToken,
    getFormData: getFormData,
    updateCampaign: async function() {
      const campaignId = getCampaignIdFromUrl();
      if (!campaignId) {
        console.error('Campaign ID not found in URL. Make sure you are on a campaign edit page.');
        return;
      }
      
      const formData = getFormData();
      return await testUpdateCampaign(campaignId, formData);
    },
    testConnection: async function() {
      try {
        const response = await fetch('http://localhost:8080/api/ping');
        const data = await response.json();
        console.log('API connection test result:', data);
        return data;
      } catch (error) {
        console.error('API connection test failed:', error);
        return { error: error.message };
      }
    }
  };
  
  console.log('Debug functions ready. You can now use:');
  console.log('- debugCampaign.getToken() - Check if you have an auth token');
  console.log('- debugCampaign.getFormData() - Get current form data');
  console.log('- debugCampaign.updateCampaign() - Test campaign update with direct API call');
  console.log('- debugCampaign.testConnection() - Test API connectivity');
})();
