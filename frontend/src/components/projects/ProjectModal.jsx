import React, { useState, useEffect } from 'react';
import { projectAPI } from '../../services/projectApi';

const ProjectModal = ({ isOpen, onClose, project, onProjectCreated, onProjectUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      coordinates: {
        lat: '',
        lon: ''
      },
      address: '',
      region: '',
      country: ''
    },
    species: [],
    timeline: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      milestones: []
    },
    budget: {
      estimatedCost: '',
      currency: 'USD',
      fundingSource: ''
    },
    status: 'planning',
    visibility: 'private',
    tags: []
  });

  const [newSpecies, setNewSpecies] = useState({
    name: '',
    scientificName: '',
    quantity: 1,
    spacing: 5,
    survivalRate: 85,
    plantingDate: '',
    notes: ''
  });

  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    targetDate: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        location: project.location || {
          coordinates: { lat: '', lon: '' },
          address: '',
          region: '',
          country: ''
        },
        species: project.species || [],
        timeline: project.timeline || {
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          milestones: []
        },
        budget: project.budget || {
          estimatedCost: '',
          currency: 'USD',
          fundingSource: ''
        },
        status: project.status || 'planning',
        visibility: project.visibility || 'private',
        tags: project.tags || []
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      if (field === 'lat' || field === 'lon') {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              ...prev.location.coordinates,
              [field]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [field]: value
          }
        }));
      }
    } else if (name.startsWith('timeline.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          [field]: value
        }
      }));
    } else if (name.startsWith('budget.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        budget: {
          ...prev.budget,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
  };

  const handleSpeciesChange = (e) => {
    const { name, value } = e.target;
    setNewSpecies(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'spacing' || name === 'survivalRate' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const addSpecies = () => {
    if (!newSpecies.name.trim()) {
      setError('Species name is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      species: [...prev.species, { ...newSpecies }]
    }));

    setNewSpecies({
      name: '',
      scientificName: '',
      quantity: 1,
      spacing: 5,
      survivalRate: 85,
      plantingDate: '',
      notes: ''
    });
  };

  const removeSpecies = (index) => {
    setFormData(prev => ({
      ...prev,
      species: prev.species.filter((_, i) => i !== index)
    }));
  };

  const addMilestone = () => {
    if (!newMilestone.name.trim()) {
      setError('Milestone name is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        milestones: [...prev.timeline.milestones, { ...newMilestone }]
      }
    }));

    setNewMilestone({
      name: '',
      description: '',
      targetDate: ''
    });
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        milestones: prev.timeline.milestones.filter((_, i) => i !== index)
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate coordinates
      const lat = parseFloat(formData.location.coordinates.lat);
      const lon = parseFloat(formData.location.coordinates.lon);
      
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new Error('Please enter valid coordinates (lat: -90 to 90, lon: -180 to 180)');
      }

      const submitData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            lat: lat,
            lon: lon
          }
        }
      };

      let result;
      if (project) {
        result = await projectAPI.updateProject(project._id, submitData);
        onProjectUpdated?.(result.project);
      } else {
        result = await projectAPI.createProject(submitData);
        onProjectCreated?.(result.project);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">
                {project ? 'Edit Project' : 'Create New Project'}
              </h2>
              <p className="text-emerald-600">
                {project ? 'Update your project details' : 'Start a new reforestation project'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe your reforestation project..."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="location.lat"
                    value={formData.location.coordinates.lat}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., -1.2921"
                    min="-90"
                    max="90"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="location.lon"
                    value={formData.location.coordinates.lon}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., 36.8219"
                    min="-180"
                    max="180"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Street address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    name="location.region"
                    value={formData.location.region}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="State/Province"
                  />
                </div>
              </div>
            </div>

            {/* Species */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Tree Species</h3>
              
              {/* Add Species Form */}
              <div className="bg-emerald-50 p-4 rounded-xl mb-4">
                <h4 className="font-medium text-emerald-900 mb-3">Add Species</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    name="name"
                    value={newSpecies.name}
                    onChange={handleSpeciesChange}
                    placeholder="Species name *"
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    name="scientificName"
                    value={newSpecies.scientificName}
                    onChange={handleSpeciesChange}
                    placeholder="Scientific name"
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    name="quantity"
                    value={newSpecies.quantity}
                    onChange={handleSpeciesChange}
                    min="1"
                    placeholder="Quantity"
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addSpecies}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    Add Species
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <input
                    type="number"
                    step="0.1"
                    name="spacing"
                    value={newSpecies.spacing}
                    onChange={handleSpeciesChange}
                    placeholder="Spacing (m)"
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    name="survivalRate"
                    value={newSpecies.survivalRate}
                    onChange={handleSpeciesChange}
                    min="0"
                    max="100"
                    placeholder="Survival rate %"
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="date"
                    name="plantingDate"
                    value={newSpecies.plantingDate}
                    onChange={handleSpeciesChange}
                    className="px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Species List */}
              {formData.species.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-emerald-900">Added Species</h4>
                  {formData.species.map((species, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-lg">
                      <div>
                        <span className="font-medium text-emerald-900">{species.name}</span>
                        {species.scientificName && (
                          <span className="text-sm text-emerald-600 ml-2">({species.scientificName})</span>
                        )}
                        <div className="text-sm text-emerald-600">
                          {species.quantity} trees • {species.spacing}m spacing • {species.survivalRate}% survival
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecies(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="timeline.startDate"
                    value={formData.timeline.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    name="timeline.endDate"
                    value={formData.timeline.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Budget</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Estimated Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="budget.estimatedCost"
                    value={formData.budget.estimatedCost}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Funding Source
                  </label>
                  <input
                    type="text"
                    name="budget.fundingSource"
                    value={formData.budget.fundingSource}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Grant, Personal"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-emerald-600 hover:text-emerald-800"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-emerald-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;