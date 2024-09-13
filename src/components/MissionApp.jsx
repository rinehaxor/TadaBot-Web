import { useState } from 'react';
import axios from 'axios';
import { Button, TextField } from '@mui/material';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MissionApp = () => {
   const [accessToken, setAccessToken] = useState('');
   const [message, setMessage] = useState('');
   const [results, setResults] = useState([]);

   const handleMissions = async () => {
      const url = 'https://backend.clutchwalletserver.xyz/activity/v2/missions?missionGroupId=eea00000-0000-4000-0000-000000000000&excludeAutoClaimable=true';
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'x-auth-client-id': 'TadaTonMiniApp',
         'x-auth-client-version': '1',
      };

      try {
         setMessage('Fetching missions...');
         const response = await axios.get(url, { headers });
         const missions = response.data;

         if (!missions || missions.length === 0) {
            setMessage('No missions found.');
            return;
         }

         setMessage(`Total missions found: ${missions.length}`);
         setResults([]);

         // Complete and claim missions
         for (let mission of missions) {
            if (mission.activityTypes && mission.activityTypes.length > 0) {
               const activityType = mission.activityTypes[0];
               await completeMission(accessToken, activityType);
               await sleep(1000);
            }

            const missionId = mission.id;
            await claimMission(accessToken, missionId);
            await sleep(1000);
         }

         setMessage('Missions completed and claimed.');
      } catch (error) {
         console.error('Error fetching or processing missions:', error);
         setMessage('Error processing missions.');
      }
   };

   const completeMission = async (accessToken, activityType) => {
      const url = `https://backend.clutchwalletserver.xyz/activity/v2/activities/${activityType}`;
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'x-auth-client-id': 'TadaTonMiniApp',
         'x-auth-client-version': '1',
      };

      try {
         const response = await axios.post(url, {}, { headers });
         const result = `Mission activity ${activityType} completed: ${JSON.stringify(response.data)}`;
         setResults((prevResults) => [...prevResults, result]);
      } catch (error) {
         const errorMessage = `Error completing mission ${activityType}: ${error}`;
         setResults((prevResults) => [...prevResults, errorMessage]);
      }
   };

   const claimMission = async (accessToken, missionId) => {
      const url = `https://backend.clutchwalletserver.xyz/activity/v2/missions/${missionId}/claim`;
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'x-auth-client-id': 'TadaTonMiniApp',
         'x-auth-client-version': '1',
      };

      try {
         const response = await axios.post(url, {}, { headers });
         const result = ` ${JSON.stringify(response.data)}`;
         setResults((prevResults) => [...prevResults]);
      } catch (error) {
         const errorMessage = `Error claiming mission ${missionId}: ${error}`;
         setResults((prevResults) => [...prevResults, errorMessage]);
      }
   };

   return (
      <div>
         <h1>Mission Completion Tada</h1>
         <div style={{ display: 'flex', flexDirection: 'column' }}>
            {' '}
            <TextField id="outlined-basic" label="Enter Access Token" variant="standard" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} style={{ margin: '10px 0' }} />
            <br />
            {/* <input type="text" placeholder="Enter Access Token" /> */}
            <Button variant="contained" onClick={handleMissions} style={{ fontFamily: 'sans-serif' }}>
               Start Missions
            </Button>
         </div>

         <p>{message}</p>

         <div>
            <h2 style={{ marginTop: '20px' }}>Mission Results</h2>
            <ul>
               {results.map((result, index) => (
                  <li key={index}>{result}</li>
               ))}
            </ul>
         </div>
      </div>
   );
};

export default MissionApp;
