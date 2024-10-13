import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { getPlanById, updatePlan } from "../utils/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";
import "../styles/PlanCreate.css"; // Reusing the same styles

const PlanEdit = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [plan, setPlan] = useState({
    nameEnglish: "",
    nameArabic: "",
    descriptionEnglish: "",
    descriptionArabic: "",
    image: null,
    isVeg: false,
    isNonVeg: false,
    isIndividual: false,
    isMultiple: false,
    category: "Lunch",
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const result = await getPlanById(planId);
        if (result.success) {
          setPlan(result.data.plan);
          setSelectedImage(result.data.plan.image);
        } else {
          console.error("Failed to fetch plan:", result.error);
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlan((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setPlan((prevState) => ({
      ...prevState,
      image: file,
    }));
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = plan.image;
      if (plan.image instanceof File) {
        const imageRef = ref(storage, `plans/${plan.image.name}`);
        await uploadBytes(imageRef, plan.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const planData = {
        ...plan,
        image: imageUrl,
      };

      const result = await updatePlan(planId, planData);
      if (result.success) {
        console.log("Plan updated successfully:", result.data);
        navigate("/plans");
      } else {
        console.error("Failed to update plan:", result.error);
        // Handle error (e.g., show error message to user)
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="admin-plan-create-wrapper">
      <h1>Edit Plan</h1>
      <form onSubmit={handleUpdatePlan} className="admin-plan-create-form">
        <div className="admin-image-container">
          <label htmlFor="file-upload" className="admin-custom-file-upload">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              "Upload Photo 200x200"
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {selectedImage && (
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setPlan((prev) => ({ ...prev, image: null }));
              }}
              className="admin-icon-button"
            >
              <FaTrash />
            </button>
          )}
        </div>
        <div className="admin-form-container">
          <input
            type="text"
            name="nameEnglish"
            placeholder="Plan Name (English)"
            value={plan.nameEnglish}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
          <input
            type="text"
            name="nameArabic"
            placeholder="Plan Name (Arabic)"
            value={plan.nameArabic}
            onChange={handleInputChange}
            required
            className="admin-input"
          />
          <textarea
            name="descriptionEnglish"
            placeholder="Plan Description (English)"
            value={plan.descriptionEnglish}
            onChange={handleInputChange}
            required
            className="admin-textarea"
          />
          <textarea
            name="descriptionArabic"
            placeholder="Plan Description (Arabic)"
            value={plan.descriptionArabic}
            onChange={handleInputChange}
            required
            className="admin-textarea"
          />
          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isVeg"
                checked={plan.isVeg}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Veg-plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isNonVeg"
                checked={plan.isNonVeg}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Non-Veg plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isIndividual"
                checked={plan.isIndividual}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Individual Plan
            </label>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isMultiple"
                checked={plan.isMultiple}
                onChange={handleInputChange}
                className="admin-checkbox"
              />
              Multiple Plan
            </label>
          </div>
          <div className="admin-form-group-category">
            <label className="admin-select-label">Category:</label>
            <select
              name="category"
              value={plan.category}
              onChange={handleInputChange}
              required
              className="admin-select"
            >
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          <div className="admin-form-btn">
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => navigate("/plans")}
            >
              Cancel
            </button>
            <button type="submit" className="admin-save-button">
              Update Plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanEdit;
