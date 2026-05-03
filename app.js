/**
 * BMI Calculator Application
 * Production-ready BMI calculator with advanced features
 * @version 1.0.0
 * @author kriikx
 */

'use strict';

/**
 * Application State Management
 */
const state = {
  currentUnit: 'metric',
  history: [],
  lastCalculation: null
};

/**
 * DOM Elements Cache
 */
const elements = {
  form: document.getElementById('bmi-form'),
  weightInput: document.getElementById('weight'),
  heightInput: document.getElementById('height'),
  ageInput: document.getElementById('age'),
  genderInput: document.getElementById('gender'),
  unitMetric: document.getElementById('unit-metric'),
  unitImperial: document.getElementById('unit-imperial'),
  resultsSection: document.getElementById('results'),
  historySection: document.getElementById('history-section'),
  bmiNumber: document.getElementById('bmi-number'),
  bmiCategoryBox: document.getElementById('bmi-category-box'),
  bmiCategoryName: document.getElementById('bmi-category-name'),
  healthTipsContainer: document.getElementById('health-tips-container'),
  idealWeightDisplay: document.getElementById('ideal-weight'),
  bmrDisplay: document.getElementById('bmr-value'),
  tdeeDisplay: document.getElementById('tdee-value'),
  healthStatusDisplay: document.getElementById('health-status'),
  resetBtn: document.getElementById('reset-btn'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  historyList: document.getElementById('history-list'),
  errorToast: document.getElementById('error-toast')
};

/**
 * Health Tips by BMI Category
 */
const healthTips = {
  underweight: {
    title: 'Underweight Tips',
    tips: [
      'Eat nutrient-dense foods with healthy fats and proteins',
      'Increase calorie intake gradually with balanced meals',
      'Include strength training to build muscle mass',
      'Consult a healthcare provider for personalized guidance'
    ]
  },
  normal: {
    title: 'Maintain Your Health',
    tips: [
      'Continue with balanced diet and regular exercise',
      'Aim for 150 minutes of moderate cardio weekly',
      'Include strength training 2-3 times per week',
      'Stay hydrated and get 7-9 hours of sleep'
    ]
  },
  overweight: {
    title: 'Weight Management Tips',
    tips: [
      'Focus on portion control and balanced nutrition',
      'Increase physical activity gradually to 30 minutes daily',
      'Limit processed foods and sugary beverages',
      'Consult a healthcare provider or nutritionist'
    ]
  },
  obese: {
    title: 'Health Improvement Plan',
    tips: [
      'Consult healthcare professionals for personalized advice',
      'Start with low-impact exercises like walking',
      'Focus on sustainable lifestyle changes, not crash diets',
      'Consider professional support from nutritionists or trainers'
    ]
  }
};

/**
 * Initialize application
 */
function initApp() {
  loadHistory();
  setupEventListeners();
  setPlaceholders();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Form submission
  elements.form.addEventListener('submit', handleFormSubmit);

  // Unit toggle
  elements.unitMetric.addEventListener('change', handleUnitChange);
  elements.unitImperial.addEventListener('change', handleUnitChange);

  // Buttons
  elements.resetBtn.addEventListener('click', resetForm);
  elements.clearHistoryBtn.addEventListener('click', clearHistory);

  // Form input validation
  elements.weightInput.addEventListener('input', validateWeight);
  elements.heightInput.addEventListener('input', validateHeight);
  elements.ageInput.addEventListener('input', validateAge);

  // Keyboard support
  elements.form.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleFormSubmit(e);
    }
  });
}

/**
 * Set input placeholders based on selected unit
 */
function setPlaceholders() {
  if (state.currentUnit === 'metric') {
    elements.weightInput.placeholder = 'e.g., 70';
    elements.heightInput.placeholder = 'e.g., 175';
  } else {
    elements.weightInput.placeholder = 'e.g., 155';
    elements.heightInput.placeholder = 'e.g., 69';
  }
}

/**
 * Handle unit change
 */
function handleUnitChange(e) {
  state.currentUnit = e.target.value;
  updateUnitLabels();
  setPlaceholders();
  clearInputs();
}

/**
 * Update unit labels in the form
 */
function updateUnitLabels() {
  const weightUnit = document.getElementById('weight-unit');
  const heightUnit = document.getElementById('height-unit');

  if (state.currentUnit === 'metric') {
    weightUnit.textContent = '(kg)';
    heightUnit.textContent = '(cm)';
  } else {
    weightUnit.textContent = '(lbs)';
    heightUnit.textContent = '(in)';
  }
}

/**
 * Validate weight input
 */
function validateWeight() {
  const value = parseFloat(elements.weightInput.value);
  const helpText = document.getElementById('weight-help');

  if (elements.weightInput.value === '') {
    helpText.textContent = '';
    return true;
  }

  if (isNaN(value) || value <= 0) {
    helpText.textContent = 'Please enter a valid positive number';
    elements.weightInput.setAttribute('aria-invalid', 'true');
    return false;
  }

  helpText.textContent = '';
  elements.weightInput.setAttribute('aria-invalid', 'false');
  return true;
}

/**
 * Validate height input
 */
function validateHeight() {
  const value = parseFloat(elements.heightInput.value);
  const helpText = document.getElementById('height-help');
  const minHeight = state.currentUnit === 'metric' ? 50 : 20;

  if (elements.heightInput.value === '') {
    helpText.textContent = '';
    return true;
  }

  if (isNaN(value) || value < minHeight) {
    helpText.textContent = `Please enter a valid height (minimum ${minHeight})`;
    elements.heightInput.setAttribute('aria-invalid', 'true');
    return false;
  }

  helpText.textContent = '';
  elements.heightInput.setAttribute('aria-invalid', 'false');
  return true;
}

/**
 * Validate age input
 */
function validateAge() {
  const value = parseFloat(elements.ageInput.value);

  if (elements.ageInput.value === '') {
    return true;
  }

  if (isNaN(value) || value < 1 || value > 150) {
    elements.ageInput.setAttribute('aria-invalid', 'true');
    return false;
  }

  elements.ageInput.setAttribute('aria-invalid', 'false');
  return true;
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();

  // Validate inputs
  if (!validateWeight() || !validateHeight() || !validateAge()) {
    showError('Please enter valid values');
    return;
  }

  const weight = parseFloat(elements.weightInput.value);
  const height = parseFloat(elements.heightInput.value);
  const age = elements.ageInput.value ? parseFloat(elements.ageInput.value) : null;
  const gender = elements.genderInput.value || null;

  // Calculate BMI
  const bmi = calculateBMI(weight, height);
  const category = getBMICategory(bmi);

  // Store in state
  state.lastCalculation = {
    bmi: bmi,
    weight: weight,
    height: height,
    age: age,
    gender: gender,
    category: category,
    unit: state.currentUnit,
    timestamp: new Date()
  };

  // Display results
  displayResults(bmi, category, weight, height, age, gender);

  // Add to history
  addToHistory(state.lastCalculation);

  // Show results section
  elements.resultsSection.removeAttribute('hidden');
  elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Calculate BMI based on selected unit
 * Formula: weight (kg) / (height (m) ^ 2)
 * Formula: (weight (lbs) / (height (in) ^ 2)) * 703
 */
function calculateBMI(weight, height) {
  let bmi;

  if (state.currentUnit === 'metric') {
    const heightInMeters = height / 100;
    bmi = weight / (heightInMeters * heightInMeters);
  } else {
    // Imperial formula
    bmi = (weight / (height * height)) * 703;
  }

  return parseFloat(bmi.toFixed(1));
}

/**
 * Get BMI category
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 24.9) return 'normal';
  if (bmi < 29.9) return 'overweight';
  return 'obese';
}

/**
 * Display results
 */
function displayResults(bmi, category, weight, height, age, gender) {
  // Update BMI value
  elements.bmiNumber.textContent = bmi.toFixed(1);

  // Update category box
  elements.bmiCategoryBox.className = `bmi-category ${category}`;
  elements.bmiCategoryName.textContent = category.charAt(0).toUpperCase() + category.slice(1);

  // Highlight active category in chart
  document.querySelectorAll('.chart-bar').forEach((bar) => {
    bar.classList.remove('active');
  });
  const categoryIndex = ['underweight', 'normal', 'overweight', 'obese'].indexOf(category);
  document.querySelectorAll('.chart-bar')[categoryIndex].classList.add('active');

  // Display health tips
  displayHealthTips(category);

  // Calculate and display additional metrics
  displayMetrics(weight, height, age, gender, bmi);
}

/**
 * Display health tips based on category
 */
function displayHealthTips(category) {
  const tips = healthTips[category];
  const html = `
    <h4>${tips.title}</h4>
    <ul>
      ${tips.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
    </ul>
  `;
  elements.healthTipsContainer.innerHTML = html;
}

/**
 * Display additional health metrics
 */
function displayMetrics(weight, height, age, gender, bmi) {
  // Calculate ideal weight range
  const minIdealWeight = 18.5 * (height / 100) ** 2;
  const maxIdealWeight = 24.9 * (height / 100) ** 2;
  const idealWeightRange = `${minIdealWeight.toFixed(1)} - ${maxIdealWeight.toFixed(1)} kg`;
  elements.idealWeightDisplay.textContent = state.currentUnit === 'imperial'
    ? `${(minIdealWeight * 2.205).toFixed(1)} - ${(maxIdealWeight * 2.205).toFixed(1)} lbs`
    : idealWeightRange;

  // Calculate BMR if age and gender are provided
  if (age && gender) {
    const bmr = calculateBMR(weight, height, age, gender);
    elements.bmrDisplay.textContent = `${bmr.toFixed(0)} cal/day`;

    // Calculate TDEE (using moderate activity multiplier of 1.55)
    const tdee = Math.round(bmr * 1.55);
    elements.tdeeDisplay.textContent = `${tdee} cal/day`;
  } else {
    elements.bmrDisplay.textContent = 'Add age & gender for calculation';
    elements.tdeeDisplay.textContent = 'Add age & gender for calculation';
  }

  // Health status
  const healthStatus = getHealthStatus(bmi);
  elements.healthStatusDisplay.textContent = healthStatus;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 */
function calculateBMR(weight, height, age, gender) {
  let bmr;

  // Convert to metric if needed
  let weightKg = state.currentUnit === 'metric' ? weight : weight / 2.205;
  let heightCm = state.currentUnit === 'metric' ? height : height * 2.54;

  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // Average for other/prefer not to say
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }

  return bmr;
}

/**
 * Get health status message
 */
function getHealthStatus(bmi) {
  if (bmi < 18.5) {
    return '⚠️ Below healthy range';
  } else if (bmi < 24.9) {
    return '✅ Healthy range';
  } else if (bmi < 29.9) {
    return '⚠️ Above healthy range';
  } else {
    return '🚨 Health attention needed';
  }
}

/**
 * Add calculation to history
 */
function addToHistory(calculation) {
  state.history.unshift(calculation);

  // Keep only last 10 items
  if (state.history.length > 10) {
    state.history.pop();
  }

  saveHistory();
  displayHistory();
}

/**
 * Display history
 */
function displayHistory() {
  if (state.history.length === 0) {
    elements.historySection.setAttribute('hidden', '');
    return;
  }

  elements.historySection.removeAttribute('hidden');

  const html = state.history
    .map(
      (item, index) => `
    <div class="history-item">
      <div class="history-item-info">
        <div class="history-item-bmi">BMI: ${item.bmi.toFixed(1)}</div>
        <div class="history-item-category">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
        <div class="history-item-date">${formatDate(item.timestamp)}</div>
      </div>
    </div>
  `
    )
    .join('');

  elements.historyList.innerHTML = html;
}

/**
 * Clear history
 */
function clearHistory() {
  if (confirm('Are you sure you want to clear all calculation history?')) {
    state.history = [];
    saveHistory();
    elements.historySection.setAttribute('hidden', '');
    elements.historyList.innerHTML = '';
    showMessage('History cleared');
  }
}

/**
 * Save history to localStorage
 */
function saveHistory() {
  try {
    const historyData = state.history.map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
    localStorage.setItem('bmiHistory', JSON.stringify(historyData));
  } catch (e) {
    console.error('Error saving history:', e);
  }
}

/**
 * Load history from localStorage
 */
function loadHistory() {
  try {
    const data = localStorage.getItem('bmiHistory');
    if (data) {
      state.history = JSON.parse(data).map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      displayHistory();
    }
  } catch (e) {
    console.error('Error loading history:', e);
  }
}

/**
 * Reset form
 */
function resetForm() {
  clearInputs();
  elements.resultsSection.setAttribute('hidden', '');
  elements.weightInput.focus();
}

/**
 * Clear all input fields
 */
function clearInputs() {
  elements.form.reset();
  elements.weightInput.setAttribute('aria-invalid', 'false');
  elements.heightInput.setAttribute('aria-invalid', 'false');
  elements.ageInput.setAttribute('aria-invalid', 'false');
}

/**
 * Show error message
 */
function showError(message) {
  elements.errorToast.textContent = `❌ ${message}`;
  elements.errorToast.style.display = 'block';

  setTimeout(() => {
    elements.errorToast.style.display = 'none';
  }, 4000);
}

/**
 * Show success message
 */
function showMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.background = 'var(--success-color)';
  toast.style.color = 'white';
  toast.textContent = `✅ ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Format date for display
 */
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
