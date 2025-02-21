import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import "./Login.css"; // Import custom CSS for styling

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("✅ Login Successful!");
      navigate("/attendance-tracker");
    } catch (error) {
      console.error("Login Error:", error.message);
      toast.error("❌ " + error.message);
    }
  };

  return (
    <div className="login-container">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row className="w-100">
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <Card className="p-4 shadow-lg login-card">
              <h2 className="text-center mb-3">🔐 Welcome Back</h2>
              <p className="text-center mb-4">Please sign in to continue</p>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail" className="mb-3 text-start">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-3 text-start">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 animated-button">
                  🚀 Login
                </Button>
              </Form>

              <p className="text-center mt-3">
                Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
              </p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Toast Notification */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default Login;
