import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus } from "react-icons/fa";
import { getAllPlans, deletePlan, getWeekMenu } from "../utils/api";
import "../styles/Plans.css";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [plansWithItems, setPlansWithItems] = useState({});
  const navigate = useNavigate();

  const fetchPlans = useCallback(async () => {
    try {
      const result = await getAllPlans();
      if (result.success) {
        setPlans(result.data);
        checkPlansWithItems(result.data);
      } else {
        console.error("Failed to fetch plans:", result.error);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const checkPlansWithItems = async (plans) => {
    const plansItemStatus = {};
    for (const plan of plans) {
      try {
        const weekMenuResult = await getWeekMenu(plan._id);
        plansItemStatus[plan._id] =
          weekMenuResult.success &&
          Object.values(weekMenuResult.data.weekMenu).some(
            (day) => day.length > 0
          );
      } catch (error) {
        console.error(`Error checking items for plan ${plan._id}:`, error);
        plansItemStatus[plan._id] = false;
      }
    }
    setPlansWithItems(plansItemStatus);
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        const result = await deletePlan(planId);
        if (result.success) {
          console.log("Plan deleted successfully");
          fetchPlans();
        } else {
          console.error("Failed to delete plan:", result.error);
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  const handleAddOrEditItems = (planId, hasItems) => {
    if (hasItems) {
      navigate(`/plans/${planId}/edit-items`);
    } else {
      navigate(`/plans/${planId}/add-items`);
    }
  };

  return (
    <div className="admin-plans-wrapper">
      <div className="admin-plans-container">
        <h1>Meal Plans</h1>

        <div className="admin-create-plan-section">
          <button
            className="admin-create-plan-btn"
            onClick={() => navigate("/plans/create")}
          >
            Create New Plan
          </button>
        </div>

        {plans.length > 0 ? (
          <div className="admin-plans-list">
            {plans.map((plan) => (
              <div key={plan._id} className="admin-plan-card">
                <h2>{plan.nameEnglish}</h2>
                <p>{plan.descriptionEnglish}</p>
                {plan.image && (
                  <img
                    src={plan.image}
                    alt={plan.nameEnglish}
                    className="admin-plan-image"
                  />
                )}
                <div className="admin-plan-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => navigate(`/plans/edit/${plan._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-delete-btn"
                    onClick={() => handleDelete(plan._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    className={`admin-${
                      plansWithItems[plan._id] ? "edit" : "add"
                    }-items-btn`}
                    onClick={() =>
                      handleAddOrEditItems(plan._id, plansWithItems[plan._id])
                    }
                  >
                    <FaPlus />{" "}
                    {plansWithItems[plan._id] ? "Edit Items" : "Add Items"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-no-plans">
            <p>No plans available. Create a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
