import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, MapPin, User, LogIn, LogOut, Calendar, Settings, Eye, Star, Trash2, BarChart3 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Rating Modal Component
const RatingModal = ({ workshop, currentUser, onClose, onSubmit, loading }) => {
  const [ratings, setRatings] = useState({
    contentSatisfaction: 0,
    speakerEffectiveness: 0,
    learnedSomething: '',
    additionalFeedback: ''
  });

  const handleSubmit = () => {
    if (ratings.contentSatisfaction === 0 || ratings.speakerEffectiveness === 0 || !ratings.learnedSomething) {
      alert('Please complete all required fields');
      return;
    }
    onSubmit(ratings);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="form-label fw-medium">{label}</label>
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`btn btn-link p-1 ${star <= value ? 'text-warning' : 'text-muted'}`}
            style={{ textDecoration: 'none' }}
          >
            <Star size={24} fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Rate Workshop</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6 className="fw-medium text-dark">{workshop.title}</h6>
              <small className="text-muted">{workshop.time} • {workshop.location}</small>
            </div>
            <div>
              <StarRating
                label="How satisfied were you with this session content? *"
                value={ratings.contentSatisfaction}
                onChange={(value) => setRatings(prev => ({ ...prev, contentSatisfaction: value }))}
              />
              <StarRating
                label="How effective was the speaker(s) in presenting the content? *"
                value={ratings.speakerEffectiveness}
                onChange={(value) => setRatings(prev => ({ ...prev, speakerEffectiveness: value }))}
              />
              <div className="mb-4">
                <label className="form-label fw-medium">Did you learn something new? *</label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="learnedSomething"
                      value="Yes"
                      checked={ratings.learnedSomething === 'Yes'}
                      onChange={(e) => setRatings(prev => ({ ...prev, learnedSomething: e.target.value }))}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="learnedSomething"
                      value="No"
                      checked={ratings.learnedSomething === 'No'}
                      onChange={(e) => setRatings(prev => ({ ...prev, learnedSomething: e.target.value }))}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium">Additional feedback about the session.</label>
                <textarea
                  className="form-control"
                  value={ratings.additionalFeedback}
                  onChange={(e) => setRatings(prev => ({ ...prev, additionalFeedback: e.target.value }))}
                  rows={4}
                  placeholder="Your feedback helps us improve future workshops..."
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Workshop Ratings Modal Component
const WorkshopRatingsModal = ({ workshop, ratings, onClose }) => {
  const averageRating = (field) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + (rating[field] || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const learnedSomethingStats = () => {
    if (!ratings || ratings.length === 0) return { yes: 0, no: 0, total: 0 };
    const yes = ratings.filter(r => r.learnedSomething === 'Yes').length;
    const no = ratings.filter(r => r.learnedSomething === 'No').length;
    return { yes, no, total: ratings.length };
  };

  const stats = learnedSomethingStats();

  const StarDisplay = ({ value, label }) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-medium">{label}</span>
        <span className="text-primary fw-bold">{value}/5.0</span>
      </div>
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= Math.round(value) ? 'text-warning' : 'text-muted'}
            fill={star <= Math.round(value) ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Workshop Ratings & Feedback</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6 className="fw-medium text-dark">{workshop.title}</h6>
              <small className="text-muted">{workshop.time} • {workshop.location}</small>
            </div>

            {!ratings || ratings.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <BarChart3 size={32} className="opacity-50 mb-3" />
                <p className="mb-0">No ratings submitted yet</p>
              </div>
            ) : (
              <>
                {/* Summary Statistics */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Rating Summary</h6>
                        <StarDisplay 
                          value={averageRating('contentSatisfaction')} 
                          label="Content Satisfaction" 
                        />
                        <StarDisplay 
                          value={averageRating('speakerEffectiveness')} 
                          label="Speaker Effectiveness" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Learning Outcomes</h6>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Learned Something New</span>
                            <span className="fw-bold text-success">{stats.yes}/{stats.total}</span>
                          </div>
                          <div className="progress mb-2">
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${stats.total > 0 ? (stats.yes / stats.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {stats.total > 0 ? Math.round((stats.yes / stats.total) * 100) : 0}% of participants
                          </small>
                        </div>
                        <div className="text-center">
                          <span className="badge bg-primary fs-6">{ratings.length} Total Responses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Feedback */}
                <div>
                  <h6 className="mb-3">Individual Feedback</h6>
                  <div className="row g-3">
                    {ratings.map((rating, index) => (
                      <div key={index} className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="mb-1">
                                  {rating.firstName || 'Anonymous'} {rating.lastName || ''}
                                </h6>
                                <small className="text-muted">
                                  Submitted: {new Date(rating.submittedAt).toLocaleDateString()}
                                </small>
                              </div>
                              <div className="text-end">
                                <span className={`badge ${rating.learnedSomething === 'Yes' ? 'bg-success' : 'bg-warning'}`}>
                                  {rating.learnedSomething === 'Yes' ? 'Learned New' : 'No New Learning'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="row mb-3">
                              <div className="col-sm-6">
                                <div className="mb-2">
                                  <small className="text-muted d-block">Content Satisfaction</small>
                                  <div className="d-flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={star <= rating.contentSatisfaction ? 'text-warning' : 'text-muted'}
                                        fill={star <= rating.contentSatisfaction ? 'currentColor' : 'none'}
                                      />
                                    ))}
                                    <span className="ms-2 small fw-bold">{rating.contentSatisfaction}/5</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-sm-6">
                                <div className="mb-2">
                                  <small className="text-muted d-block">Speaker Effectiveness</small>
                                  <div className="d-flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={star <= rating.speakerEffectiveness ? 'text-warning' : 'text-muted'}
                                        fill={star <= rating.speakerEffectiveness ? 'currentColor' : 'none'}
                                      />
                                    ))}
                                    <span className="ms-2 small fw-bold">{rating.speakerEffectiveness}/5</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {rating.additionalFeedback && (
                              <div className="border-top pt-3">
                                <small className="text-muted d-block mb-2">Additional Feedback</small>
                                <p className="mb-0 small">{rating.additionalFeedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkshopRegistration = () => {
  const API_BASE_URL = process.env.REACT_APP_API_GATEWAY_INVOKE_URL;
  
  // State management
  const [workshops, setWorkshops] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingWorkshop, setLoadingWorkshop] = useState(null); // Track which workshop is loading
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminWorkshops, setAdminWorkshops] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminData, setAdminData] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [userRatings, setUserRatings] = useState([]);

  // New states for admin ratings view
  const [showWorkshopRatings, setShowWorkshopRatings] = useState(false);
  const [selectedWorkshopRatings, setSelectedWorkshopRatings] = useState([]);
  const [adminRatingsData, setAdminRatingsData] = useState({});

  // API Functions
  const api = {
    async request(endpoint, options = {}) {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      };
      try {
        const response = await fetch(url, config);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed');
        return data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    async getWorkshops() { return this.request('/workshops'); },
    async login(ticketId) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ ticketId }) }); },
    async registerForWorkshop(ticketId, workshopId) { return this.request('/registrations', { method: 'POST', body: JSON.stringify({ ticketId, workshopId }) }); },
    async getRegistrations(ticketId) { return this.request(`/registrations/${ticketId}`); },
    async withdrawRegistration(ticketId, workshopId) { return this.request(`/registrations/${ticketId}/${workshopId}`, { method: 'DELETE' }); },
    async adminWithdrawRegistration(ticketId, workshopId) { 
      return this.request(`/admin/registrations/${ticketId}/${workshopId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${currentUser?.ticketId}` }
      }); 
    },
    async getAdminData() { return this.request('/admin/registrations', { headers: { 'Authorization': `Bearer ${currentUser?.ticketId}` } }); },
    async submitRating(ticketId, workshopId, rating) { return this.request('/ratings', { method: 'POST', body: JSON.stringify({ ticketId, workshopId, ...rating }) }); },
    async getRatings(ticketId) { return this.request(`/ratings/${ticketId}`); },
    // New API method for admin to get all ratings for a workshop
    async getWorkshopRatings(workshopId) {
      return this.request(`/admin/ratings/${workshopId}`, {
        headers: { 'Authorization': `Bearer ${currentUser?.ticketId}` }
      });
    }
  };

  const loadWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getWorkshops();
      setWorkshops(data.workshops || []);
    } catch (error) {
      console.error('Failed to load workshops:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserRegistrations = useCallback(async (ticketId) => {
    try {
      const data = await api.getRegistrations(ticketId);
      setUserRegistrations(data.registrations || []);
      const ratingsData = await api.getRatings(ticketId);
      setUserRatings(ratingsData.ratings || []);
    } catch (error) {
      console.error('Failed to load user registrations:', error);
      setUserRegistrations([]);
      setUserRatings([]);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedUser && savedUserData) {
      const userData = JSON.parse(savedUserData);
      setCurrentUser(userData);
      setIsAdmin(userData.isAdmin || false);
      setAdminWorkshops(userData.adminWorkshops || []);
      loadUserRegistrations(userData.ticketId);
    }
    
    loadWorkshops();
  }, [loadUserRegistrations, loadWorkshops]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminData();
      setAdminData(data.registrations || []);
      // Load ratings for accessible workshops
      const accessibleWorkshops = getAdminAccessibleWorkshops();
      const ratingsPromises = accessibleWorkshops.map(async (workshop) => {
        try {
          const ratings = await api.getWorkshopRatings(workshop.id);
          return { workshopId: workshop.id, ratings: ratings.ratings || [] };
        } catch (error) {
          console.error(`Failed to load ratings for workshop ${workshop.id}:`, error);
          return { workshopId: workshop.id, ratings: [] };
        }
      });
      
      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      ratingsResults.forEach(result => {
        ratingsMap[result.workshopId] = result.ratings;
      });
      setAdminRatingsData(ratingsMap);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setAdminData([]);
      setAdminRatingsData({});
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!ticketId.trim()) return;
    try {
      setLoading(true);
      setLoginError('');
      const data = await api.login(ticketId.toUpperCase());
      if (data.success) {
        const userData = {
          ticketId: data.user.ticketId,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          fullName: `${data.user.firstName} ${data.user.lastName}`,
          isAdmin: data.user.isAdmin || false,
          adminWorkshops: data.user.adminWorkshops || []
        };
        setCurrentUser(userData);
        setIsAdmin(userData.isAdmin);
        setAdminWorkshops(userData.adminWorkshops);
        localStorage.setItem('currentUser', userData.ticketId);
        localStorage.setItem('userData', JSON.stringify(userData));
        setTicketId('');
        await loadUserRegistrations(userData.ticketId);
      }
    } catch (error) {
      setLoginError(error.message || 'Invalid ticket ID. Please check your ticket and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminWorkshops([]);
    setShowAdmin(false);
    setUserRegistrations([]);
    setAdminData([]);
    setUserRatings([]);
    setLoadingWorkshop(null);
    setAdminRatingsData({});
    setShowWorkshopRatings(false);
    setSelectedWorkshopRatings([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
  };

  const registerForWorkshop = async (workshopId) => {
    if (!currentUser) return;
    try {
      setLoadingWorkshop(workshopId); // Set loading for this specific workshop
      await api.registerForWorkshop(currentUser.ticketId, workshopId);
      await loadWorkshops();
      await loadUserRegistrations(currentUser.ticketId);
    } catch (error) {
      alert(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoadingWorkshop(null); // Clear loading state
    }
  };

  const withdrawRegistration = async (workshopId) => {
    if (!currentUser) return;
    try {
      setLoadingWorkshop(workshopId); // Set loading for this specific workshop
      await api.withdrawRegistration(currentUser.ticketId, workshopId);
      await loadWorkshops();
      await loadUserRegistrations(currentUser.ticketId);
    } catch (error) {
      alert(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setLoadingWorkshop(null); // Clear loading state
    }
  };

  const adminWithdrawRegistration = async (ticketId, workshopId, participantName) => {
    if (!currentUser || !isAdmin) return;
    
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw ${participantName} (${ticketId}) from this workshop?`
    );
    
    if (!confirmWithdraw) return;
    
    try {
      setLoading(true);
      await api.adminWithdrawRegistration(ticketId, workshopId);
      await loadWorkshops();
      await loadAdminData();
      alert(`Successfully withdrew ${participantName} from the workshop.`);
    } catch (error) {
      alert(error.message || 'Failed to withdraw registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (ratingData) => {
    if (!currentUser || !selectedWorkshop) return;
    try {
      setLoading(true);
      await api.submitRating(currentUser.ticketId, selectedWorkshop.id, ratingData);
      await loadUserRegistrations(currentUser.ticketId);
      setShowRatingModal(false);
      setSelectedWorkshop(null);
      alert('Thank you for your feedback!');
    } catch (error) {
      alert(error.message || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewWorkshopRatings = (workshop) => {
    const ratings = adminRatingsData[workshop.id] || [];
    setSelectedWorkshop(workshop);
    setSelectedWorkshopRatings(ratings);
    setShowWorkshopRatings(true);
  };

  const isUserRegistered = (workshopId) => userRegistrations.some(reg => reg.workshopId === workshopId);
  const hasUserRated = (workshopId) => userRatings.some(rating => rating.workshopId === workshopId);
  const hasWorkshopEnded = (workshop) => true; // For demo purposes
  const openRatingModal = (workshop) => { setSelectedWorkshop(workshop); setShowRatingModal(true); };
  const getAvailableSpots = (workshop) => workshop.maxCapacity - (workshop.currentRegistrations || 0);
  const toggleAdminView = () => { if (!showAdmin) loadAdminData(); setShowAdmin(!showAdmin); };

  const getRegistrationsByWorkshop = () => {
    const grouped = {};
    adminData.forEach(reg => {
      if (!grouped[reg.workshopId]) grouped[reg.workshopId] = [];
      grouped[reg.workshopId].push(reg);
    });
    return grouped;
  };

  const canAdminManageWorkshop = (workshopId) => {
    if (!isAdmin) return false;
    if (adminWorkshops.includes('*')) return true; // Super admin
    return adminWorkshops.includes(workshopId);
  };

  const getAdminAccessibleWorkshops = () => {
    if (!isAdmin) return [];
    if (adminWorkshops.includes('*')) return workshops; // Super admin sees all
    return workshops.filter(workshop => adminWorkshops.includes(workshop.id));
  };

  if (showAdmin && isAdmin) {
    const registrationsByWorkshop = getRegistrationsByWorkshop();
    const accessibleWorkshops = getAdminAccessibleWorkshops();
    
    return (
      <div className="min-vh-100 bg-light">
        <header className="bg-white border-bottom">
          <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h3 mb-1">Admin Dashboard</h1>
                <p className="text-muted mb-0">
                  Workshop registration management
                  {adminWorkshops.includes('*') 
                    ? ' (All Workshops)' 
                    : ` (${adminWorkshops.length} Workshop${adminWorkshops.length !== 1 ? 's' : ''})`
                  }
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 bg-primary bg-opacity-10 px-3 py-2 rounded">
                  <Settings size={16} className="text-primary" />
                  <span className="fw-medium text-primary">{currentUser.fullName}</span>
                </div>
                <button onClick={toggleAdminView} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <Eye size={16} />
                  <span>Back to User View</span>
                </button>
                <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading registration data...</p>
            </div>
          ) : accessibleWorkshops.length === 0 ? (
            <div className="text-center py-5">
              <Settings size={48} className="text-muted opacity-50 mb-4" />
              <h4 className="text-muted">No Workshop Access</h4>
              <p className="text-muted">You don't have admin access to any workshops.</p>
            </div>
          ) : (
            <div className="row g-4">
              {accessibleWorkshops.map(workshop => {
                const registrations = registrationsByWorkshop[workshop.id] || [];
                const availableSpots = getAvailableSpots(workshop);
                const workshopRatings = adminRatingsData[workshop.id] || [];
                
                return (
                  <div key={workshop.id} className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                          <div className="flex-grow-1">
                            <h5 className="card-title">{workshop.title}</h5>
                            <div className="d-flex gap-4 text-muted small">
                              <span className="d-flex align-items-center gap-1">
                                <Clock size={16} />
                                {workshop.time}
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <MapPin size={16} />
                                {workshop.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="small text-muted mt-1">{availableSpots} spots left</div>
                            <div className="mt-2">
                              <button
                                onClick={() => viewWorkshopRatings(workshop)}
                                className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2"
                                disabled={workshopRatings.length === 0}
                              >
                                <BarChart3 size={16} />
                                <span>View Ratings</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {registrations.length > 0 ? (
                          <div className="border-top pt-4">
                            <h6 className="mb-3">Registered Participants</h6>
                            <div className="row g-3">
                              {registrations.map((reg, index) => (
                                <div key={index} className="col-md-6 col-lg-4">
                                  <div className="card bg-light">
                                    <div className="card-body py-3">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                          <div className="fw-medium">{reg.firstName} {reg.lastName}</div>
                                          <div className="text-muted small mt-1">{reg.ticketId}</div>
                                          <div className="text-muted small mt-1">
                                            Registered: {new Date(reg.registrationTime).toLocaleDateString()}
                                          </div>
                                        </div>
                                        {canAdminManageWorkshop(reg.workshopId) && (
                                          <button
                                            onClick={() => adminWithdrawRegistration(
                                              reg.ticketId, 
                                              reg.workshopId, 
                                              `${reg.firstName} ${reg.lastName}`
                                            )}
                                            disabled={loading}
                                            className="btn btn-outline-danger btn-sm ms-2"
                                            title={`Withdraw ${reg.firstName} ${reg.lastName}`}
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="border-top pt-4">
                            <div className="text-center py-4 text-muted">
                              <Users size={32} className="opacity-50 mb-3" />
                              <p className="mb-0">No registrations yet</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        
        {/* Workshop Ratings Modal */}
        {showWorkshopRatings && selectedWorkshop && (
          <WorkshopRatingsModal
            workshop={selectedWorkshop}
            ratings={selectedWorkshopRatings}
            onClose={() => {
              setShowWorkshopRatings(false);
              setSelectedWorkshop(null);
              setSelectedWorkshopRatings([]);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-white border-bottom">
        <div className="container py-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h3 mb-1">AWS Community Day CEE Workshops</h1>
              <p className="text-muted mb-0">Reserve your spot at our exciting technical workshops</p>
            </div>
            
            <div className="d-flex align-items-center gap-3 w-100 w-lg-auto">
              {currentUser ? (
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 w-100">
                  <div className="d-flex align-items-center gap-2 bg-success bg-opacity-10 px-3 py-2 rounded">
                    <User size={16} className="text-success" />
                    <span className="fw-medium text-success">{currentUser.fullName}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {isAdmin && (
                      <button onClick={toggleAdminView} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
                        <Settings size={16} />
                        <span>Admin</span>
                      </button>
                    )}
                    <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 w-100">
                  <input
                    type="text"
                    className="form-control form-control"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter your ticket ID"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    disabled={loading}
                  />
                  <button
                    onClick={handleLogin}
                    disabled={loading || !ticketId.trim()}
                    className="btn btn-primary btn d-flex align-items-center justify-content-center gap-2 w-100"
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <LogIn size={16} />
                    )}
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {loginError && (
            <div className="alert alert-danger mt-3" role="alert">
              {loginError}
            </div>
          )}
        </div>
      </header>

      <main className="container py-4">
        {!currentUser && (
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <LogIn size={20} className="me-3" />
            <div>
              <strong>Login with your Eventbrite ticket ID (barcode number)</strong>
              <div className="small">Don't have a ticket yet? Purchase one at <a href="https://www.eventbrite.com/e/aws-community-day-cee-tickets-1300914453149">Eventbrite</a>.</div>
            </div>
          </div>
        )}

        {loading && workshops.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading workshops...</p>
          </div>
        ) : (
          <>
            <div className="row g-4 mb-5">
              {workshops.map((workshop) => {
                const availableSpots = getAvailableSpots(workshop);
                const isRegistered = isUserRegistered(workshop.id);
                const isFull = availableSpots === 0;
                const isWorkshopLoading = loadingWorkshop === workshop.id;
                
                return (
                  <div key={workshop.id} className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title">{workshop.title}</h5>
                          <span className={`badge ${
                            availableSpots > 5 ? 'bg-success' :
                            availableSpots > 0 ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {availableSpots} spots left
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center text-muted small mb-2">
                            <Clock size={16} className="me-2" />
                            {workshop.time}
                          </div>
                          <div className="d-flex align-items-center text-muted small mb-2">
                            <MapPin size={16} className="me-2" />
                            {workshop.location}
                          </div>
                          <div className="d-flex align-items-start text-muted small">
                            <Users size={16} className="me-2 mt-1" />
                            <span>{workshop.speakers.join(', ')}</span>
                          </div>
                        </div>

                        <p className="card-text flex-grow-1 small" dangerouslySetInnerHTML={{ __html: workshop.abstract }} />

                        <div className="border-top pt-3 mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center text-muted small">
                              <Calendar size={16} className="me-2" />
                              <span>{workshop.currentRegistrations || 0} / {workshop.maxCapacity} registered</span>
                            </div>
                            
                            {currentUser ? (
                              <div>
                                {isRegistered ? (
                                  <button
                                    onClick={() => withdrawRegistration(workshop.id)}
                                    disabled={isWorkshopLoading}
                                    className="btn btn-outline-danger btn-sm"
                                  >
                                    {isWorkshopLoading ? 'Processing...' : 'Withdraw Registration'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => registerForWorkshop(workshop.id)}
                                    disabled={isFull || isWorkshopLoading}
                                    className={`btn btn-sm ${isFull || isWorkshopLoading ? 'btn-secondary' : 'btn-primary'}`}
                                  >
                                    {isWorkshopLoading ? 'Processing...' : isFull ? 'Workshop Full' : 'Register'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <small className="text-muted">Login to register</small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentUser && (
              <div>
                <h2 className="h4 mb-4">Your Registrations</h2>
                {userRegistrations.length > 0 ? (
                  <div className="row g-4">
                    {userRegistrations.map(registration => {
                      const workshop = workshops.find(w => w.id === registration.workshopId);
                      if (!workshop) return null;
                      
                      const hasRated = hasUserRated(workshop.id);
                      const workshopEnded = hasWorkshopEnded(workshop);
                      
                      return (
                        <div key={registration.workshopId} className="col-md-6 col-lg-4">
                          <div className="card border-success">
                            <div className="card-body">
                              <h6 className="card-title text-success">{workshop.title}</h6>
                              <p className="card-text small text-muted">{workshop.time} • {workshop.location}</p>
                              <p className="card-text small text-success">
                                Registered: {new Date(registration.registrationTime).toLocaleDateString()}
                              </p>
                              
                              {workshopEnded && (
                                <div className="border-top pt-3 mt-3">
                                  {hasRated ? (
                                    <div className="d-flex align-items-center text-warning">
                                      <Star size={16} className="me-2" fill="currentColor" />
                                      <span className="fw-medium">Rated</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => openRatingModal(workshop)}
                                      className="btn btn-warning btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                    >
                                      <Star size={16} />
                                      <span>Rate Workshop</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <Calendar size={48} className="text-muted opacity-50 mb-4" />
                      <p className="card-text">You haven't registered for any workshops yet.</p>
                      <small className="text-muted">Browse the workshops above and click "Register" to reserve your spot!</small>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {showRatingModal && selectedWorkshop && (
          <RatingModal
            workshop={selectedWorkshop}
            currentUser={currentUser}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedWorkshop(null);
            }}
            onSubmit={submitRating}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

export default WorkshopRegistration;
