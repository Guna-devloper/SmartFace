import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../firebase";
import { Container, Form, Button, Card, Row, Col } from "react-bootstrap";
import "./Signup.css"; // Import CSS for styling

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("🎉 Account Created Successfully!");
      navigate("/");
    } catch (error) {
      toast.error("❌ " + error.message);
    }
  };

  return (
    <div className="signup-container">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row className="w-100">
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <Card className="p-4 shadow-lg signup-card">
              <h2 className="text-center mb-3">🚀 Get Started</h2>
              <p className="text-center mb-4">Create your account</p>
              <Form onSubmit={handleSignup}>
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field"
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 animated-button">
                  ✅ Sign Up
                </Button>
              </Form>

              <p className="text-center mt-3">
                Already have an account? <a href="/login" className="login-link">Login</a>
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

export default Signup;
