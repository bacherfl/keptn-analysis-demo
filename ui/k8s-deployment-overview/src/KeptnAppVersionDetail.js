import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, Chip, Grid, Typography, Divider, Modal, FormControl, Button, InputLabel, MenuItem, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Select from '@mui/material/Select';
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from 'react-router-dom';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function KeptnAppVersionDetail() {
    const { id } = useParams();
    const [KeptnAppVersion, setKeptnAppVersion] = useState([]);
    const [AnalysisDefinitions, setAnalysisDefinitions] = useState([]);
    const [open, setOpen] = useState(false);
    const [analysisWorkload, setAnalysisWorkload] = useState('');
    const [selectedAnalysisDefinition, setSelectedAnalysisDefinition] = useState('');
    const [analysisTriggered, setAnalysisTriggered] = useState(false);
    const [activeAnalysis, setActiveAnalysis] = useState({});
    const [analysisResults, setAnalysisResults] = useState({});
    const [activeTask, setActiveTask] = useState({});

    function handleAnalyseTest(task) {
      setOpen(true);
      setActiveTask(task)
    }

    const handleClose = () => setOpen(false);

    async function startAnalysis(e) {
      console.log("triggering analysis for " + analysisWorkload);
      setAnalysisTriggered(true);
      try {
        const response = await axios.post('/api/analysis', {
          timeframe: {
            from: activeTask.startTime,
            to: activeTask.endTime
          },
          workloadName: analysisWorkload,
          analysisDefinition: selectedAnalysisDefinition
        });
        console.log('Analysis resource created:', response.data);
        setAnalysisTriggered(false);
        if (response.status == 201) {
          setActiveAnalysis(response.data);
          fetchAnalysisDetails(response.data);
        }
        // Handle success or navigate to another page
      } catch (error) {
        console.error('Error creating analysis resource:', error);
        // Handle error, display error message, etc.
      }
    }

    async function fetchAnalysisDetails(activeAnalysis) {
      let pollingInterval;
      if (activeAnalysis && activeAnalysis?.status?.state !== 'Completed') {
        pollingInterval = setInterval(async () => {
          try {
            const response = await axios.get(`/api/analysis/${activeAnalysis?.metadata?.name}`);
            setActiveAnalysis(response.data);
            
            // If the status is completed, stop polling
            if (response.data.status.state === 'Completed') {
              clearInterval(pollingInterval);
              let resultsJSON = JSON.parse(response.data.status.raw);
              console.log(resultsJSON);
              setAnalysisResults(resultsJSON);
            }
          } catch (error) {
            console.error('Error fetching resource status:', error);
          }
        }, 2000); // Poll every 2 seconds
      }
    }

    const handleAnalysisWorkloadChange = (event) => {
      setAnalysisWorkload(event.target.value);
    };

    const handleSelectedAnalysisDefinitionChange = (event) => {
      setSelectedAnalysisDefinition(event.target.value);
    };

    function getCriteria(target) {
      if (target.greaterThan !== undefined) {
        return `> ${target.greaterThan.fixedValue}`
      }
      if (target.greaterThanOrEqual !== undefined) {
        return `>= ${target.greaterThanOrEqual.fixedValue}`
      }
      if (target.lessThan !== undefined) {
        return `< ${target.lessThan.fixedValue}`
      }
      if (target.lessThanOrEqual !== undefined) {
        return `> ${target.lessThanOrEqual.fixedValue}`
      }
      if (target.equalTo !== undefined) {
        return `== ${target.equalTo.fixedValue}`
      }
      if (target.inRange !== undefined) {
        return `>= ${target.inRange.lowBound} && <= ${target.inRange.highBound}`
      }
      if (target.notInRange !== undefined) {
        return `<= ${target.notInRange.lowBound} && >= ${target.notInRange.highBound}`
      }
    }

    function getScorePercentage(achieved, max) {
      let value = ((achieved / max) * 100 ).toFixed(2)
      return value
    }
  
    useEffect(() => {
      async function fetchKeptnAppVersionDetails() {
        try {
          const response = await axios.get(`/api/keptnappversions/${id}`);
          setKeptnAppVersion(response.data);
        } catch (error) {
          console.error('Error fetching KeptnAppVersion details:', error);
        }
      }

      async function fetchAnalysisDefinitions() {
        try {
          const response = await axios.get(`/api/analysisdefinitions`);
          console.log(response.data);
          setAnalysisDefinitions(response.data);
        } catch (error) {
          console.error('Error fetching AnalysisDefinitions:', error);
        }
      }
      
      fetchKeptnAppVersionDetails();
      fetchAnalysisDefinitions();
    }, [id]);
  
    return (
      <Box>
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Box sx={{ my: 3, mx: 2 }}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Typography gutterBottom variant="h4" component="div">
                {KeptnAppVersion?.metadata?.name}
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom variant="h6" component="div">
                {KeptnAppVersion?.status?.currentPhase}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Divider variant="middle" />
          <Box sx={{ m: 2 }}>
            <Typography gutterBottom variant="body1">
              Workloads
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Workload</TableCell>
                    <TableCell align="right">Version</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {KeptnAppVersion?.status?.workloadStatus?.map((row) => (
                    <TableRow
                      key={row.workload?.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.workload?.name}
                      </TableCell>
                      <TableCell align="right">{row.workload?.version}</TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ m: 2 }}>
            <Typography gutterBottom variant="body1">
              Post Deployment Tasks
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Start</TableCell>
                    <TableCell align="right">End</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {KeptnAppVersion?.status?.postDeploymentTaskStatus?.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="right">{row.status}</TableCell>
                      <TableCell align="right">{row.startTime}</TableCell>
                      <TableCell align="right">{row.endTime}</TableCell>
                      <TableCell align="right">{row.status = "Succeeded" ? <Button onClick={() => handleAnalyseTest(row)}>Analyse</Button> : null}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{...style, width: 800}}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Analyse: {activeTask.name}
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Select the workload to analyse
            </Typography>
            <Divider light />
            <FormControl fullWidth>
              <InputLabel id="select-workload">Workload</InputLabel>
              <Select
                labelId="select-workload"
                id="select-workload"
                value={analysisWorkload}
                label="Workload"
                onChange={handleAnalysisWorkloadChange}
              >
                {KeptnAppVersion?.status?.workloadStatus?.map((row) => (
                    <MenuItem value={row.workload?.name}>
                        {row.workload?.name}
                    </MenuItem>
                  ))}
              </Select>
              <Divider light />
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Select an AnalysisDefinition
              </Typography>
              <InputLabel id="select-analysisdefinition"></InputLabel>
              <Select
                labelId="select-analysisdefinition"
                id="select-analysisdefinition"
                value={selectedAnalysisDefinition}
                label="AnalysisDefinition"
                onChange={handleSelectedAnalysisDefinitionChange}
              >
                {AnalysisDefinitions?.map((row) => (
                    <MenuItem value={row.metadata?.name}>
                        {row.metadata?.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            { analysisWorkload !== "" && selectedAnalysisDefinition !== "" ? <Button onClick={startAnalysis}>Analyse {analysisWorkload}</Button> : null }

            { analysisTriggered ?
              <Box><LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              Executing Analysis
            </LoadingButton></Box>
            : null }
            { activeAnalysis?.metadata?.name !== undefined && activeAnalysis?.metadata?.name !== "" ?
            <Box>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Analysis: {activeAnalysis?.metadata?.name} - {activeAnalysis?.status?.state}
              </Typography>
              { analysisResults !== undefined && activeAnalysis?.status?.state === "Completed" ? 
                <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="div">
                    Analysis Results
                  </Typography>
                  <List>
                    {analysisResults?.objectiveResults?.map((objective, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Objective ${index + 1}:`}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                Name: {objective.objective.analysisValueTemplateRef.name}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.primary">
                                Query: {objective.query}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.primary">
                                Value: {objective.value.toFixed(3)}
                              </Typography>
                              <br />
                              { objective.objective?.target?.failure !== undefined ?
                              <div>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Fail Criteria: { getCriteria(objective.objective?.target?.failure) }
                                </Typography>
                                <br />
                              </div>                            
                              : null }
                              { objective.objective?.target?.warning !== undefined ?
                              <div>
                                <Typography component="span" variant="body2" color="text.primary">
                                  Warning Criteria: { getCriteria(objective.objective?.target?.warning) }
                                </Typography>
                                <br />
                              </div>                            
                              : null }
                              <Typography component="span" variant="body2" color="text.primary">
                                Score: {objective.score}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="h6" component="div">
                    Total Score: {analysisResults.totalScore} / {analysisResults.maximumScore} ({getScorePercentage(analysisResults.totalScore, analysisResults.maximumScore)}%)
                  </Typography>
                  <Typography variant="body2" color={analysisResults.pass ? 'primary' : 'error'}>
                    {analysisResults.pass &&  
                        <Chip label="Pass" color="success" variant="outlined" /> 
                    }
                    { !analysisResults.pass && analysisResults.warning &&  
                        <Chip label="Warning" color="warning" variant="outlined" /> 
                    }
                    { !analysisResults.pass && !analysisResults.warning &&  
                        <Chip label="Fail" color="error" variant="outlined" /> 
                    }
                  </Typography>
                  {analysisResults.warning && (
                    <Typography variant="body2" color="warning">
                      Warning: There are issues that need attention.
                    </Typography>
                  )}
                </CardContent>
              </Card>
              : null }
            </Box>
            
            : null }
          </Box>
        </Modal>
      </Box>
    );
  }
  
  export default KeptnAppVersionDetail;