import React, { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase"; // Firebase Firestore
import { Table, Container, Card, Row, Col, Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title);

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [searchRollNo, setSearchRollNo] = useState("");

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "attendance"));
      let attendanceList = [];
      let presentCount = 0;
      let absentCount = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attendanceList.push({
          id: doc.id,
          rollNo: data.rollNo,
          timestamp: new Date(data.timestamp).toLocaleString(),
          status: "Present", // Only present students are recorded
        });

        presentCount += 1; // Update present count
      });

      absentCount = 100 - presentCount; // Assuming 100 total students (adjust as needed)
      setAttendanceData(attendanceList);
      setTotalPresent(presentCount);
      setTotalAbsent(absentCount);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  // Filter data based on Roll No
  const filteredData = attendanceData.filter((record) =>
    record.rollNo.includes(searchRollNo)
  );

  // Chart Data
  const chartData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Attendance Count",
        data: [totalPresent, totalAbsent],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">📊 Attendance Dashboard</h2>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3 shadow-lg">
            <h4>Total Present: <span className="text-success">{totalPresent}</span></h4>
            <h4>Total Absent: <span className="text-danger">{totalAbsent}</span></h4>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 shadow-lg">
            <Bar data={chartData} />
          </Card>
        </Col>
      </Row>

      <Card className="p-4 shadow-lg">
        <h3>📋 Attendance Records</h3>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search by Roll Number"
            value={searchRollNo}
            onChange={(e) => setSearchRollNo(e.target.value)}
          />
        </Form.Group>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={record.id}>
                <td>{record.rollNo}</td>
                <td>{record.timestamp}</td>
                <td className="text-success">{record.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Dashboard;
