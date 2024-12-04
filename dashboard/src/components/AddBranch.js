import React, { useState } from "react";
import { createBranch } from "../utils/api2";
import "../styles/AddBranch.css";
import { useNavigate } from "react-router-dom";

const AddBranch = () => {
  const [formData, setFormData] = useState({
    name: "",
    crNumber: "",
    municipalityNumber: "",
    vatNumber: "",
    serviceRadius: "",
    address: {
      country: "",
      mainAddress: "",
      apartment: "",
      city: "",
      state: "",
      pincode: "",
    },
    dynamicAttributes: [],
  });

  const [newAttribute, setNewAttribute] = useState({
    name: "",
    value: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(""); // Clear any previous errors

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setFormData((prev) => ({
        ...prev,
        dynamicAttributes: [...prev.dynamicAttributes, { ...newAttribute }],
      }));
      setNewAttribute({ name: "", value: "" });
    }
  };

  const validateForm = () => {
    // Validate service radius is a positive number
    const serviceRadiusNum = parseFloat(formData.serviceRadius);
    if (isNaN(serviceRadiusNum) || serviceRadiusNum <= 0) {
      setError("Please enter a valid service radius greater than 0");
      return false;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Branch name is required");
      return false;
    }

    if (!formData.crNumber.trim()) {
      setError("CR Number is required");
      return false;
    }

    if (!formData.municipalityNumber.trim()) {
      setError("Municipality Number is required");
      return false;
    }

    if (!formData.vatNumber.trim()) {
      setError("VAT Number is required");
      return false;
    }

    // Validate address fields
    const requiredAddressFields = [
      "country",
      "mainAddress",
      "city",
      "state",
      "pincode",
    ];
    for (const field of requiredAddressFields) {
      if (!formData.address[field].trim()) {
        setError(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const finalData = {
        ...formData,
        serviceRadius: parseFloat(formData.serviceRadius),
      };

      const response = await createBranch(finalData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/branches");
        }, 2000); // Navigate after 2 seconds to show success message
      } else {
        setError(response.error || "Failed to create branch");
      }
    } catch (error) {
      console.error("Error creating branch:", error);
      setError("An unexpected error occurred while creating the branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="branch-container">
      <div className="branch-header">
        <h2>Add New Branch</h2>
      </div>

      {error && (
        <div className="alert error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span>Branch created successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="branch-form">
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Branch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>CR Number</label>
              <input
                type="text"
                name="crNumber"
                value={formData.crNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Municipality Number</label>
              <input
                type="text"
                name="municipalityNumber"
                value={formData.municipalityNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Address Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Country/Region</label>
              <select
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="half-width"
                required
              >
                <option value="">Select Country</option>
                <option value="india">India</option>
                <option value="saudi">Saudi Arabia</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address.mainAddress"
                value={formData.address.mainAddress}
                onChange={handleChange}
                placeholder="Street address or P.O. box"
                required
              />
            </div>
            <div className="form-group">
              <label>Apartment/Suite/Floor (Optional)</label>
              <input
                type="text"
                name="address.apartment"
                value={formData.address.apartment}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, floor, etc."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PIN Code/Postal Code</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="half-width"
                maxLength={formData.address.country === "india" ? 6 : 5}
                pattern={
                  formData.address.country === "india" ? "[0-9]{6}" : "[0-9]{5}"
                }
                title={`Please enter a valid ${
                  formData.address.country === "india" ? "6" : "5"
                }-digit postal code`}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Service Area</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Service Radius (km)</label>
              <input
                type="number"
                name="serviceRadius"
                value={formData.serviceRadius}
                onChange={handleChange}
                className="half-width"
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>
        </div>

        <div className="dynamic-attributes">
          <h3>Additional Attributes</h3>
          <div className="attribute-inputs">
            <input
              type="text"
              placeholder="Attribute Name"
              value={newAttribute.name}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Attribute Value"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute({ ...newAttribute, value: e.target.value })
              }
            />
            <button
              type="button"
              onClick={handleAddAttribute}
              disabled={loading}
            >
              Add
            </button>
          </div>

          {formData.dynamicAttributes.map((attr, index) => (
            <div key={index} className="attribute-item">
              <span>
                {attr.name}: {attr.value}
              </span>
              <button
                type="button"
                onClick={() => {
                  const newAttributes = formData.dynamicAttributes.filter(
                    (_, i) => i !== index
                  );
                  setFormData((prev) => ({
                    ...prev,
                    dynamicAttributes: newAttributes,
                  }));
                }}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Branch"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/branches")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBranch;