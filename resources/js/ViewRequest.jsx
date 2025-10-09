import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, Check, X, ChevronDown, Eye, Pencil } from 'lucide-react';
import GlobalHeader from './components/GlobalHeader';
import HomeSidebar from './HomeSidebar';
import VerificationModal from './components/VerificationModal';
import SimpleConfirmModal from './components/SimpleConfirmModal.jsx';
import SuccessModal from './components/SuccessModal';
import ViewTransactionModal from './components/ViewTransactionModal';
import EditTransactionModal from './components/EditTransactionModal';
import { useRequestData } from './hooks/useRequestData';
import { activityLogService } from './services/activityLogService';
import api from './services/api';

const ViewRequest = () => {
  // Use custom hook for data management
  const {
    pendingRequests,
    approvedRequests,
    currentHolders,
    verifyReturns,
    loading,
    error,
    refreshData,
    setPendingRequests,
    setApprovedRequests,
    setCurrentHolders
  } = useRequestData();

  // Handle scroll events for fade-out effect
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setScrollY(scrollContainerRef.current.scrollTop);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState('viewRequest');
  const [scrollY, setScrollY] = useState(0);
  const scrollContainerRef = useRef(null);
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'approve' or 'reject'
    requestData: null,
    reason: ''
  });

  // Success modal state
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    type: null, // 'approve' or 'reject'
    requestData: null
  });

  // Simple confirm modal state for check/X buttons
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    mode: null, // 'approve' | 'delete'
    requestId: null
  });

  // View and Edit modal states
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    transactionData: null
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    transactionData: null
  });

  const handleSelect = (next) => {
    setView(next);
    setIsMenuOpen(false);
  };

  // Handler functions for approve and reject actions
  const handleApprove = (requestId) => {
    const requestToApprove = pendingRequests.find(req => req.id === requestId);
    
    if (requestToApprove) {
      setModalState({
        isOpen: true,
        type: 'approve',
        requestData: requestToApprove,
        reason: ''
      });
    }
  };

  // Row click opens the detailed approval modal
  const handleRowClick = (requestId) => {
    const req = pendingRequests.find(r => r.id === requestId);
    if (!req) return;
    setModalState({
      isOpen: true,
      type: 'approve',
      requestData: req,
      reason: ''
    });
  };

  const handleReject = (requestId) => {
    const requestToReject = pendingRequests.find(req => req.id === requestId);
    
    if (requestToReject) {
      setModalState({
        isOpen: true,
        type: 'reject',
        requestData: requestToReject,
        reason: ''
      });
    }
  };

  // Modal handlers
  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      type: null,
      requestData: null,
      reason: ''
    });
  };

  const handleModalConfirm = async () => {
    const { type, requestData } = modalState;
    
    try {
      setLoading(true);
      
      if (type === 'approve') {
        const response = await api.post(`/requests/${requestData.id}/approve`, {
          approval_notes: modalState.reason
        });
        
        if (response.data.success) {
          // Log the approval activity
          await activityLogService.logRequestApproval(requestData.id, requestData);
          
          // Remove from pending requests
          setPendingRequests(prev => prev.filter(req => req.id !== requestData.id));
          
          // Add to approved requests
          const approvedRequest = {
            ...requestData,
            status: "approved",
            approved_by_name: "Admin",
            approved_at: new Date().toISOString()
          };
          
          setApprovedRequests(prev => [...prev, approvedRequest]);
          
          // Show success message
          setSuccessModal({
            isOpen: true,
            type: 'approve',
            requestData: requestData
          });
          
          // Redirect to dedicated View Approved page after a short delay
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/viewapproved';
            }
          }, 2000);
        }
      } else if (type === 'reject') {
        const response = await api.post(`/requests/${requestData.id}/reject`, {
          rejection_reason: modalState.reason
        });
        
        if (response.data.success) {
          // Log the rejection activity
          await activityLogService.logRequestRejection(requestData.id, requestData, modalState.reason);
          
          // Remove from pending requests
          setPendingRequests(prev => prev.filter(req => req.id !== requestData.id));
          
          // Show success message
          setSuccessModal({
            isOpen: true,
            type: 'reject',
            requestData: requestData
          });
        }
      }
      
      handleModalClose();
    } catch (err) {
      console.error('Error processing request:', err);
      setError('Error processing request: ' + (err.response?.data?.message || err.message));
      
      // Show error toast or modal
      alert('Error processing request: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReasonChange = (reason) => {
    setModalState(prev => ({ ...prev, reason }));
  };

  // View and Edit modal handlers
  const handleViewTransaction = (transactionId) => {
    const transaction = currentHolders.find(t => t.id === transactionId);
    if (transaction) {
      setViewModal({
        isOpen: true,
        transactionData: transaction
      });
    }
  };

  const handleEditTransaction = (transactionId) => {
    const transaction = currentHolders.find(t => t.id === transactionId);
    if (transaction) {
      setEditModal({
        isOpen: true,
        transactionData: transaction
      });
    }
  };

  const handleCloseViewModal = () => {
    setViewModal({
      isOpen: false,
      transactionData: null
    });
  };

  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      transactionData: null
    });
  };

  const handleTransactionUpdate = async (updatedTransaction) => {
    try {
      // Log the transaction update
      await activityLogService.logTransactionUpdate(updatedTransaction.id, updatedTransaction);
      
      // Update the current holders list with the updated transaction
      setCurrentHolders(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      );
    } catch (error) {
      console.error('Error logging transaction update:', error);
      // Still update the UI even if logging fails
      setCurrentHolders(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      );
    }
  };

  // Removed auto-switch: keep user's selected view (default: 'viewRequest')

  // Small UI formatter helpers
  const formatRequestMode = (mode) => {
    const normalized = (mode || '').toString().toLowerCase();
    if (['work_from_home', 'w.f.h', 'wfh', 'work from home'].includes(normalized)) {
      return 'W.F.H';
    }
    return 'On-site';
  };

  // Success modal handlers
  const handleSuccessModalClose = () => {
    setSuccessModal({
      isOpen: false,
      type: null,
      requestData: null
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex">
      <style jsx>{`
        .btn-wrapper {
          position: relative;
          display: inline-block;
        }

        .btn {
          --border-radius: 18px;
          --padding: 3px;
          --transition: 0.3s;
          --button-color: #0064FF;
          --highlight-color-hue: 210deg;

          user-select: none;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.35em 0.4em 0.35em 0.8em;
          font-family: "Poppins", "Inter", "Segoe UI", sans-serif;
          font-size: 0.75em;
          font-weight: 500;
          min-width: 96px;
          height: 28px;

          background-color: var(--button-color);

          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.25),
            inset 0 2px 2px rgba(255, 255, 255, 0.15);

          border: solid 1px rgba(255,255,255,0.3);
          border-radius: var(--border-radius);
          cursor: pointer;

          transition:
            box-shadow var(--transition),
            border var(--transition),
            background-color var(--transition);
        }
        .btn::before {
          content: "";
          position: absolute;
          top: calc(0px - var(--padding));
          left: calc(0px - var(--padding));
          width: calc(100% + var(--padding) * 2);
          height: calc(100% + var(--padding) * 2);
          border-radius: calc(var(--border-radius) + var(--padding));
          pointer-events: none;
          background-image: linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.08));

          z-index: -1;
          transition:
            box-shadow var(--transition),
            filter var(--transition);
          box-shadow: none;
        }
        .btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          pointer-events: none;
          background-image: linear-gradient(
            0deg,
            #fff,
            hsl(var(--highlight-color-hue), 100%, 70%),
            hsla(var(--highlight-color-hue), 100%, 70%, 50%),
            8%,
            transparent
          );
          background-position: 0 0;
          opacity: 0;
          transition:
            opacity var(--transition),
            filter var(--transition);
        }

        .btn-letter {
          position: relative;
          display: inline-block;
          color: #fff5;
          animation: letter-anim 2s ease-in-out infinite;
          transition:
            color var(--transition),
            text-shadow var(--transition),
            opacity var(--transition);
        }

        @keyframes letter-anim {
          50% {
            text-shadow: 0 0 3px #fff8;
            color: #fff;
          }
        }

        .btn-svg {
          flex-grow: 1;
          height: 14px;
          margin-right: 0.5rem;
          fill: #EAF2FF;
          animation: flicker 2s linear infinite;
          animation-delay: 0.5s;
          filter: none;
          transition:
            fill var(--transition),
            filter var(--transition),
            opacity var(--transition);
        }
        @keyframes flicker {
          50% {
            opacity: 0.3;
          }
        }

        .txt-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 4.5em;
        }
        .txt-1,
        .txt-2 {
          position: absolute;
          word-spacing: -1em;
        }
        .txt-1 {
          animation: appear-anim 1s ease-in-out forwards;
        }
        .txt-2 {
          opacity: 0;
        }
        @keyframes appear-anim {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .btn:focus .txt-1 {
          animation: opacity-anim 0.3s ease-in-out forwards;
          animation-delay: 1s;
        }
        .btn:focus .txt-2 {
          animation: opacity-anim 0.3s ease-in-out reverse forwards;
          animation-delay: 1s;
        }
        @keyframes opacity-anim {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .btn:focus .btn-letter {
          animation:
            focused-letter-anim 1s ease-in-out forwards,
            letter-anim 1.2s ease-in-out infinite;
          animation-delay: 0s, 1s;
        }
        @keyframes focused-letter-anim {
          0%,
          100% {
            filter: blur(0px);
          }
          50% {
            transform: scale(2);
            filter: blur(10px) brightness(150%)
              drop-shadow(-36px 12px 12px hsl(var(--highlight-color-hue), 100%, 70%));
          }
        }
        .btn:focus .btn-svg {
          animation-duration: 1.2s;
          animation-delay: 0.2s;
        }

        .btn:focus::before { box-shadow: none; }
        .btn:focus::after {
          opacity: 0.6;
          mask-image: linear-gradient(0deg, #fff, transparent);
          filter: brightness(100%);
        }

        .btn-letter:nth-child(1),
        .btn:focus .btn-letter:nth-child(1) {
          animation-delay: 0s;
        }
        .btn-letter:nth-child(2),
        .btn:focus .btn-letter:nth-child(2) {
          animation-delay: 0.08s;
        }
        .btn-letter:nth-child(3),
        .btn:focus .btn-letter:nth-child(3) {
          animation-delay: 0.16s;
        }
        .btn-letter:nth-child(4),
        .btn:focus .btn-letter:nth-child(4) {
          animation-delay: 0.24s;
        }
        .btn-letter:nth-child(5),
        .btn:focus .btn-letter:nth-child(5) {
          animation-delay: 0.32s;
        }
        .btn-letter:nth-child(6),
        .btn:focus .btn-letter:nth-child(6) {
          animation-delay: 0.4s;
        }
        .btn-letter:nth-child(7),
        .btn:focus .btn-letter:nth-child(7) {
          animation-delay: 0.48s;
        }
        .btn-letter:nth-child(8),
        .btn:focus .btn-letter:nth-child(8) {
          animation-delay: 0.56s;
        }
        .btn-letter:nth-child(9),
        .btn:focus .btn-letter:nth-child(9) {
          animation-delay: 0.64s;
        }

        .btn:active {
          border: solid 1px hsla(var(--highlight-color-hue), 100%, 80%, 70%);
          background-color: hsla(var(--highlight-color-hue), 50%, 20%, 0.5);
        }
        .btn:active::before { box-shadow: none; }
        .btn:active::after {
          opacity: 1;
          mask-image: linear-gradient(0deg, #fff, transparent);
          filter: brightness(200%);
        }
        .btn:active .btn-letter {
          text-shadow: 0 0 1px hsla(var(--highlight-color-hue), 100%, 90%, 90%);
          animation: none;
        }

        .btn:hover {
          border: solid 1px hsla(var(--highlight-color-hue), 100%, 80%, 40%);
        }

        .btn:hover::before { box-shadow: none; }

        .btn:hover::after {
          opacity: 1;
          mask-image: linear-gradient(0deg, #fff, transparent);
        }

        .btn:hover .btn-svg { fill: #ffffff; filter: none; animation: none; }
      `}</style>
      <HomeSidebar />
    <div className="flex-1 flex flex-col">
        <GlobalHeader title="View Request" />

      <main className="px-10 py-6 mb-10 flex flex-col overflow-hidden">
        {/* Scrollable Content Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto transaction-scrollbar sticky-transition"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {/* Labels that fade out on scroll */}
          <div 
            className={`transition-all duration-500 ease-in-out ${
              scrollY > 50 ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-blue-600 transition-all duration-300">Transaction</h2>
                <h3 className="text-base font-semibold text-gray-700 mt-3 tracking-wide transition-all duration-300">QUICK ACCESS</h3>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards - scroll with content initially, then stick at top */}
          <div className="sticky top-0 z-10 bg-white pb-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-9 transition-all duration-300">
              <div className="bg-gradient-to-b from-[#0064FF] to-[#003C99] text-white rounded-2xl p-3 shadow flex flex-col h-26">
                <h4 className="text-sm uppercase tracking-wider opacity-80">New Requests</h4>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-5xl font-bold">{pendingRequests.length}</p>
                  <div className="w-6 h-6 rounded-full bg-white/30"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-3 shadow flex flex-col h-26">
                <h4 className="text-xs font-semibold text-gray-600">Current Holder</h4>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">{approvedRequests.length}</p>
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-3 shadow flex flex-col h-26">
                <h4 className="text-xs font-semibold text-gray-600">Verify Return</h4>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-900">{verifyReturns.length}</p>
                  <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>

        {/* Dropdown will be shown inside each section header aligned with its title */}

{view === 'viewRequest' && (
  <>
    <div className="mt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">View Request</h4>
          <div className="relative">
            <button
              type="button"
              className="w-44 h-10 bg-gray-300 rounded-md flex items-center justify-between px-4 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-sm font-medium">
                {view === 'viewRequest' ? 'View Request' : 
                 view === 'viewApproved' ? 'View Approved' :
                 view === 'currentHolder' ? 'Current holder' : 'Verify return'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 bg-white rounded-md shadow border border-gray-200">
                <button onClick={() => handleSelect('viewRequest')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">View Request</button>
                <button onClick={() => handleSelect('currentHolder')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Current holder</button>
                <button onClick={() => handleSelect('verifyReturn')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Verify return</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex text-xs font-medium text-gray-900 uppercase tracking-wider mb-4 px-4 mt-4">
          <div className="flex-1">Name</div>
          <div className="flex-1">Item</div>
          <div className="w-32 text-right">Actions</div>
        </div>
      </div>
      
      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Loading pending requests...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">
          Error: {error}
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No pending requests found
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((req, index) => (
            <div
              key={req.id}
              onClick={() => handleRowClick(req.id)}
              className="flex items-center py-4 px-4 rounded-xl cursor-pointer border-2 bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
            >
              {/* Name */}
              <div className="flex-1">
              <div className="text-base font-medium text-gray-900">{req.full_name}</div>
              </div>
              
              {/* Item  */}
              <div className="flex-1">
                <span className="inline-block text-gray-900 text-sm font-medium px-3 py-1 rounded-md">
                  {req.equipment_name}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="w-32 flex items-center justify-end space-x-2">
                <div className="btn-wrapper">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setConfirmModal({ isOpen: true, mode: 'approve', requestId: req.id });
                    }}
                    className="btn"
                    title="Approve Request"
                    type="button"
                  >
                    <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="txt-wrapper">
                      <div className="txt-1">
                        <span className="btn-letter">A</span>
                        <span className="btn-letter">p</span>
                        <span className="btn-letter">p</span>
                        <span className="btn-letter">r</span>
                        <span className="btn-letter">o</span>
                        <span className="btn-letter">v</span>
                        <span className="btn-letter">e</span>
                      </div>
                      <div className="txt-2">
                        <span className="btn-letter">A</span>
                        <span className="btn-letter">p</span>
                        <span className="btn-letter">p</span>
                        <span className="btn-letter">r</span>
                        <span className="btn-letter">o</span>
                        <span className="btn-letter">v</span>
                        <span className="btn-letter">i</span>
                        <span className="btn-letter">n</span>
                        <span className="btn-letter">g</span>
                      </div>
                    </div>
                  </button>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleReject(req.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md border-2 border-red-400 hover:border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Reject Request"
                  type="button"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
)}

{view === 'currentHolder' && (
  <>
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Current holder</h3>
        <div className="relative">
          <button
            type="button"
            className="w-44 h-10 bg-gray-300 rounded-md flex items-center justify-between px-4 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-sm font-medium">
              {view === 'viewRequest' ? 'View Request' : 
               view === 'viewApproved' ? 'View Approved' :
               view === 'currentHolder' ? 'Current holder' : 'Verify return'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-44 bg-white rounded-md shadow border border-gray-200">
              <button onClick={() => handleSelect('viewRequest')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">View Request</button>
              <button onClick={() => handleSelect('currentHolder')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Current holder</button>
              <button onClick={() => handleSelect('verifyReturn')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Verify return</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Position</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Request mode</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">End Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Loading current holders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : currentHolders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No current holders found
                  </td>
                </tr>
              ) : (
                currentHolders.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {row.name || 'John Doe'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {row.position || 'Manager'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {row.item || 'Laptop'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {formatRequestMode(row.requestMode)}
                    </td>
                    <td className="py-4 px-6 text-sm text-red-600 font-medium">
                      {row.expectedReturnDate ? new Date(row.expectedReturnDate).toLocaleDateString() : '2025-10-23'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Active
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                          Released
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
)}

{view === 'verifyReturn' && (
  <>
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Verify return</h3>
        <div className="relative">
          <button
            type="button"
            className="w-44 h-10 bg-gray-300 rounded-md flex items-center justify-between px-4 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-sm font-medium">
              {view === 'viewRequest' ? 'View Request' : 
               view === 'viewApproved' ? 'View Approved' :
               view === 'currentHolder' ? 'Current holder' : 'Verify return'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-44 bg-white rounded-md shadow border border-gray-200">
              <button onClick={() => handleSelect('viewRequest')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">View Request</button>
              <button onClick={() => handleSelect('currentHolder')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Current holder</button>
              <button onClick={() => handleSelect('verifyReturn')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Verify return</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Position</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Request mode</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">End Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Loading verify returns...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : verifyReturns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No returns to verify found
                  </td>
                </tr>
              ) : (
                verifyReturns.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {row.full_name || 'John Doe'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {row.position || 'Manager'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {row.equipment_name || 'Laptop'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {formatRequestMode(row.request_mode)}
                    </td>
                    <td className="py-4 px-6 text-sm text-red-600 font-medium">
                      {row.return_date || row.expected_return_date || '2025-10-23'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                          Returned
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
)}
          </div>
        </main>
      </div>
      
      {/* Verification Modal */}
      <VerificationModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        type={modalState.type}
        requestData={modalState.requestData}
        title={modalState.type === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={modalState.type === 'approve' 
          ? 'Are you sure you want to approve this request? This will move it to the approved list.'
          : 'Are you sure you want to reject this request? This action cannot be undone.'
        }
        confirmText={modalState.type === 'approve' ? 'Approve Request' : 'Reject Request'}
        cancelText="Cancel"
        showReasonInput={modalState.type === 'reject'}
        reason={modalState.reason}
        onReasonChange={handleReasonChange}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={handleSuccessModalClose}
        type={successModal.type}
        requestData={successModal.requestData}
        action={successModal.type === 'approve' ? 'approved' : 'rejected'}
      />

      {/* Simple Confirm Modal for check/X */}
      <SimpleConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, mode: null, requestId: null })}
        onConfirm={async () => {
          if (confirmModal.mode === 'approve') {
            try {
              const response = await api.post(`/requests/${confirmModal.requestId}/approve`);
              if (response.data.success) {
            const requestToApprove = pendingRequests.find(req => req.id === confirmModal.requestId);
            if (requestToApprove) {
              setPendingRequests(prev => prev.filter(req => req.id !== confirmModal.requestId));
              const approvedRequest = {
                ...requestToApprove,
                    status: 'approved',
                    approved_by_name: 'Admin',
                    approved_at: new Date().toISOString()
              };
              setApprovedRequests(prev => [...prev, approvedRequest]);
                }
              }
            } catch (err) {
              console.error('Error approving request:', err);
              alert('Error approving request: ' + (err.response?.data?.message || err.message));
            }
          } else if (confirmModal.mode === 'delete') {
            // For delete, open the detailed reject modal to capture optional reason
            const requestToReject = pendingRequests.find(req => req.id === confirmModal.requestId);
            if (requestToReject) {
              setModalState({ isOpen: true, type: 'reject', requestData: requestToReject, reason: '' });
            }
          }
          setConfirmModal({ isOpen: false, mode: null, requestId: null });
        }}
        title={confirmModal.mode === 'approve' ? 'Approving Request' : 'Deleting Request'}
        message={'Are you sure you want to continue?'}
        confirmText={confirmModal.mode === 'approve' ? 'Approve' : 'Delete'}
        confirmTone={confirmModal.mode === 'approve' ? 'primary' : 'danger'}
      />

      {/* View Transaction Modal */}
      <ViewTransactionModal
        isOpen={viewModal.isOpen}
        onClose={handleCloseViewModal}
        transactionData={viewModal.transactionData}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        transactionData={editModal.transactionData}
        onUpdate={handleTransactionUpdate}
      />
    </div>
  );
};

export default ViewRequest;