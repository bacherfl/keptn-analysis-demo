import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function KeptnAppVersionDetail() {
    const { id } = useParams();
    const [KeptnAppVersion, setKeptnAppVersion] = useState([]);
  
    useEffect(() => {
      async function fetchKeptnAppVersionDetails() {
        try {
          const response = await axios.get(`/api/keptnappversions`); // Replace with your API endpoint
          console.log(response.data);
          setKeptnAppVersion(response.data[0]);
        } catch (error) {
          console.error('Error fetching KeptnAppVersion details:', error);
        }
      }
  
      fetchKeptnAppVersionDetails();
    }, [id]);
  
    return (
      <div>
        <h2>KeptnAppVersion Details: {id}</h2>
        <p>Name: {KeptnAppVersion?.metadata?.name}</p>
      </div>
    );
  }
  
  export default KeptnAppVersionDetail;