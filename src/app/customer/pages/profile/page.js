'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiPackage, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(18, 11, 16, 0.65)',
    zIndex: 10000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '460px',
    padding: '32px',
    borderRadius: '0px',
    border: '1px solid #E8DFC8',
    background: '#FFFFFF',
    boxShadow: 'none',
  },
};

const ProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneno: '',
    city: '',
    imageUrl: '',
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phoneno: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (!userId) {
          toast.info('Please sign in to view your client profile');
          router.push('/login');
          return;
        }

        const response = await axios.get(`/api/users/${userId}`);
        const data = response.data;

        if (data) {
          setUserData({
            name: data.name,
            email: data.email,
            phoneno: data.phoneno,
            city: data.city,
            imageUrl: data.imageUrl || '',
          });

          setEditData({
            name: data.name,
            phoneno: data.phoneno,
            city: data.city,
          });
        } else {
          toast.error('Client record not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile record.');
      }
    };

    fetchUserData();
  }, [router]);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!editData.name || !editData.phoneno || !editData.city) {
      toast.error('Please complete all fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        '/api/users/update_profile',
        {
          ...editData,
          id: userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        toast.success('Client profile updated successfully!');
        closeModal();
        setUserData((prev) => ({ ...prev, ...editData }));
        localStorage.setItem('userName', editData.name);
      } else {
        toast.error(`Update failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      toast.error('Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FBF9F7] min-h-screen text-[#141311] pb-24">
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white border-b border-[#E8DFC8] py-8">
        <div className="container mx-auto max-w-[1536px] px-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              <span className="cursor-pointer hover:text-[#141311]" onClick={() => router.push('/')}>
                Atelier
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-[#141311] font-bold">Client Membership</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141311]">
              My Beauty Atelier Profile
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/customer/pages/orders')}
              className="px-5 py-2.5 bg-white border border-[#E8DFC8] hover:border-[#141311] text-[#141311] text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center gap-2"
            >
              <FiPackage size={14} /> View Order Archive
            </button>
            <button
              onClick={openModal}
              className="px-5 py-2.5 bg-[#141311] hover:bg-[#2A1B24] text-white text-xs font-bold uppercase tracking-widest rounded-none border border-[#141311] transition-all flex items-center gap-2"
            >
              <FiEdit3 size={14} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 lg:px-8 pt-10">
        <div className="bg-white border border-[#E8DFC8] rounded-none p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-8 border-b border-[#E8DFC8]">
            <div className="w-28 h-28 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none flex items-center justify-center relative overflow-hidden flex-shrink-0">
              {userData.imageUrl ? (
                <Image
                  src={
                    userData.imageUrl.startsWith('http')
                      ? userData.imageUrl
                      : `${process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL}/${userData.imageUrl}`
                  }
                  alt={userData.name || 'Portrait'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <FiUser size={40} className="text-[#B98C2D]" />
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B98C2D] flex items-center justify-center sm:justify-start gap-1 mb-1">
                <HiSparkles size={12} />
                Privilege Beauty Client
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#141311] mb-1">
                {userData.name || 'Valued Client'}
              </h2>
              <p className="text-xs text-gray-400 font-light mb-4">{userData.email || '—'}</p>

              <div className="inline-flex items-center gap-2 bg-[#F9F5EC] px-3 py-1.5 border border-[#E8DFC8] text-[11px] font-bold uppercase tracking-wider text-[#141311]">
                <span>Status:</span>
                <span className="text-emerald-700">Verified Client Member</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
            <div className="p-5 bg-[#F9F5EC] border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FiUser className="text-[#B98C2D]" />
                <span>Full Legal Name</span>
              </div>
              <p className="text-sm font-bold text-[#141311]">{userData.name || '—'}</p>
            </div>

            <div className="p-5 bg-[#F9F5EC] border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FiMail className="text-[#B98C2D]" />
                <span>Dispatch Email</span>
              </div>
              <p className="text-sm font-bold text-[#141311] truncate">{userData.email || '—'}</p>
            </div>

            <div className="p-5 bg-[#F9F5EC] border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FiPhone className="text-[#B98C2D]" />
                <span>Primary Mobile Number</span>
              </div>
              <p className="text-sm font-bold text-[#141311] font-mono">{userData.phoneno || '—'}</p>
            </div>

            <div className="p-5 bg-[#F9F5EC] border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FiMapPin className="text-[#B98C2D]" />
                <span>Default Region / City</span>
              </div>
              <p className="text-sm font-bold text-[#141311]">{userData.city || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for updating profile */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="Edit Profile Modal"
        ariaHideApp={false}
      >
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E8DFC8]">
          <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[#141311]">
            Edit Client Profile
          </h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-black">
            <FiX size={18} />
          </button>
        </div>

        <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none focus:border-[#B98C2D] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Phone Number (+92xxxxxxxxxx)
            </label>
            <input
              type="text"
              name="phoneno"
              value={editData.phoneno}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none focus:border-[#B98C2D] outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              City / Destination
            </label>
            <input
              type="text"
              name="city"
              value={editData.city}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#F9F5EC] border border-[#E8DFC8] rounded-none focus:border-[#B98C2D] outline-none"
              required
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 border border-[#E8DFC8] text-[#141311] text-[11px] font-bold uppercase tracking-widest rounded-none hover:border-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#141311] hover:bg-[#2A1B24] text-white text-[11px] font-bold uppercase tracking-widest rounded-none border border-[#141311] transition-colors"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
