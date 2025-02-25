import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Import Firestore database
import { collection, getDocs } from "firebase/firestore";
import { Table, Container, Card, Row, Col, Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title } from "chart.js";
import "./Dashboard.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title);

const Dashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [searchRollNo, setSearchRollNo] = useState("");

  useEffect(() => {
    fetchStudentData();
    fetchAttendanceRecords();
  }, []);

  // ✅ Fetch Total Students from "students" Collection
  const fetchStudentData = async () => {
    try {
      const studentsSnapshot = await getDocs(collection(db, "students"));
      setTotalStudents(studentsSnapshot.size);
    } catch (error) {
      console.error("Error fetching total students:", error);
    }
  };

  // ✅ Fetch Attendance Records from "attendance" Collection
  const fetchAttendanceRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "attendance"));
      let attendanceList = [];
      let presentCount = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        attendanceList.push({
          id: doc.id,
          rollNo: data.rollNo,
          timestamp: new Date(data.timestamp).toLocaleString(),
          status: "Present", // Only present students are recorded
        });

        presentCount += 1; // Count present students
      });

      // ✅ Dynamically Calculate Absent Students
      const absentCount = totalStudents - presentCount;

      setAttendanceData(attendanceList);
      setTotalPresent(presentCount);
      setTotalAbsent(absentCount >= 0 ? absentCount : 0); // Ensure it doesn't go negative
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  // ✅ Filter Data Based on Roll No
  const filteredData = attendanceData.filter((record) =>
    record.rollNo.toLowerCase().includes(searchRollNo.toLowerCase())
  );

  // ✅ Chart Data
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
    <Container className="dashboard-container">
      <h2 className="text-center mb-4">📊 Attendance Dashboard</h2>

      <Row className="mb-4">
        <Col xs={12} sm={6}>
          <Card className="dashboard-card shadow-lg">
            <h5>Total Students: <span className="text-primary">{totalStudents}</span></h5>
            <h5>Total Present: <span className="text-success">{totalPresent}</span></h5>
            <h5>Total Absent: <span className="text-danger">{totalAbsent}</span></h5>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="dashboard-card shadow-lg">
            <Bar data={chartData} />
          </Card>
        </Col>
      </Row>

      <Card className="p-4 shadow-lg">
        <h3>📋 Attendance Records</h3>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="🔍 Search by Roll Number"
            value={searchRollNo}
            onChange={(e) => setSearchRollNo(e.target.value)}
          />
        </Form.Group>

        <Table striped bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <tr key={record.id}>
                  <td>{record.rollNo}</td>
                  <td>{record.timestamp}</td>
                  <td className="text-success">{record.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No records found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Dashboard;
