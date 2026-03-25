"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

const TRANSLATIONS = {
  en: {
    // App Roles & Branding
    appRoleTripPlanner: "Trip Planner",
    appRoleExplorerPro: "Explorer · Pro",
    appRoleTourGuide: "Tour Guide",
    authBrandTagline: "Plan. Explore. Remember.",
    
    // Auth Screens
    splashTitleLine1: "Ready to Dream?",
    splashTitleLine2: "Let's Travel.",
    splashSubtitle: "Discover breathtaking destinations, plan unforgettable trips, and connect with a global community of explorers.",
    splashGetStarted: "Get Started",
    splashSignIn: "Sign In",
    splashGuideLogin: "Tour guide login",
    authGuideBanner: "You are signing in to the tour guide portal.",
    authHeroTitleLine1: "Every journey begins",
    authHeroTitleLine2: "with a single step.",
    authHeroSubtitle: "Join millions of travelers who plan their dream trips with DreamTrip.",
    authSignInTab: "Sign In",
    authCreateAccountTab: "Create Account",
    authTablistAria: "Sign in or create an account",
    authInterestHint: "Tap what excites you — pick at least one.",
    
    loginWelcomeBack: "Welcome back!",
    loginSubtitle: "Sign in to continue your travel journey",
    loginEmailLabel: "Email Address",
    loginPasswordLabel: "Password",
    loginForgotPassword: "Forgot password?",
    loginSigningIn: "Signing in...",
    loginSignIn: "Sign In",
    loginErrorEmpty: "Please enter your email and password.",
    loginErrorFailed: "Sign in failed. Check your credentials.",
    
    signupTitle: "Create your account",
    signupSubtitle: "Start planning your Sri Lanka adventure",
    signupFullName: "Full Name",
    signupNext: "Next",
    signupInterestsTitle: "Select your interests",
    signupInterestsSubtitle: "We use these to generate AI recommendations.",
    signupCreating: "Creating account...",
    signupCreateAccount: "Create Account",
    signupBack: "Back",
    signupErrorSelectInterest: "Please select at least one interest.",
    signupErrorFailed: "Sign up failed. Please try again.",
    signupErrorFillAll: "Please fill in all fields.",
    signupErrorPasswordLen: "Password must be at least 6 characters.",
    
    catFood: "Food and Local Life",
    catFamily: "Family Friendly",
    
    // Main Navigation (Sidebar)
    navHome: "Home",
    navExplore: "Explore",
    navTourGuides: "Tour Guides",
    navMyTrips: "My Trips",
    navWishlist: "Wishlist",
    navProfile: "Profile",
    navNotifications: "Notifications",
    navSettings: "Settings",
    navGuideDashboard: "Dashboard",
    navGuideBookings: "Booking Requests",
    navGuideStories: "Stories / Blog Posts",
    navDiscover: "Discover",
    navTripsLabel: "Trips",
    navAccountLabel: "Account",
    navGuidePortalLabel: "Guide Portal",
    catBeach: "Beach",
    catHill: "Hill Country",
    catCultural: "Culture",
    catNature: "Nature",
    
    // Guide Portal - General
    hubTitle: "Guide Hub",
    hubSubtitle: "Manage your professional profile, booking requests, and personal trips.",
    bookingRequestsTitle: "Booking Requests",
    bookingRequestsSubtitle: "Manage your incoming tour reservations and client requests.",
    incomingRequestsTab: "Incoming Requests",
    noIncomingRequests: "No pending booking requests at the moment.",
    pastReservationsTitle: "Past Reservations",
    acceptButton: "Accept",
    declineButton: "Decline",
    travelersCountLabel: "Travelers",
    myBookingRequestsTitle: "My Booking Requests",
    noTravelerBookings: "You haven't sent any booking requests yet.",
    bookingStatusAccepted: "Accepted",
    bookingStatusPending: "Pending",
    bookingStatusRejected: "Declined",
    withGuideLabel: "with",
    editProfileHeader: "Public Professional Profile",
    listProfilePublicly: "Display my profile to travelers",
    signInToAccessHub: "Please sign in to access your Guide Hub.",
    
    // Guide Portal - Profile Form
    displayNameLabel: "Profile Display Name",
    headlineLabel: "Professional Headline",
    headlinePlaceholder: "e.g. Kandy Heritage Walks & Hill-Country Hikes",
    locationLabel: "Operating Base",
    hourlyRateLabel: "Service Rate (LKR/hr)",
    languagesLabel: "Languages Spoken",
    expertiseLabel: "Specialties & Expertise",
    experienceYearsLabel: "Years of Guiding Experience",
    bioLabel: "Professional Biography",
    availabilityLabel: "General Availability",
    availabilityPlaceholder: "Weekends, regions covered, booking notice...",
    saveProfileButton: "Save Profile",
    savingProgress: "Saving...",
    
    // Profile Edit Screen (General)
    editProfileTitle: "Edit Profile Info",
    editProfileSubtitle: "Fine-tune your traveler identity and security settings.",
    firstNameLabel: "First Name",
    lastNameLabel: "Last Name",
    dobLabel: "Date of Birth",
    phoneNumberLabel: "Phone Number",
    emailLabel: "Email Address",
    passwordLabel: "New Password",
    confirmPasswordLabel: "Confirm Password",
    
    // Homepage
    homeTitle: "Sri Lanka Awaits",
    homeMorning: "Good morning",
    homeAfternoon: "Good afternoon",
    homeEvening: "Good evening",
    homeRefreshing: "Refreshing...",
    homeRefreshAI: "Refresh AI",
    homeRecommended: "Recommended for you by AI",
    homeTripStyle: "Trip style",
    homePopularItineraries: "Popular Itineraries",
    homeHiddenGems: "Hidden Gems",
    homeThrillingAdventures: "Thrilling Adventures",
    homeOpenMap: "Open map",
    homeRecommendationsError: "Could not load recommendations.",
    homeRefreshFailed: "Refresh failed.",
    homeLoadingRecommendations: "AI is crafting your perfect itinerary...",
    bioPlaceholder: "Tell us about yourself...",
    saveButton: "Save Changes",
    cancelButton: "Cancel",
    profileEdit: "Edit Profile",
    profileSignOut: "Sign Out",
    
    // Stories Feature
    writeNewStory: "Share a New Experience",
    storyTitleLabel: "Experience Title",
    storyTitlePlaceholder: "e.g. Sunrise at Sigiriya",
    storyBodyLabel: "Tell your story here...",
    storyBodyPlaceholder: "Share your experience with other travelers...",
    addStoryButton: "Save New Story",
    yourStoriesLabel: "My Collection",
    saveAllStories: "Publish All",
    noStoriesFound: "No stories yet. Start writing!",
    untitledStory: "Untitled Experience",
    storiesSavedHighlight: "Your stories have been synchronized.",
    
    // Status & Actions
    loadingData: "Loading...",
    savingProgress: "Saving...",
    profileSavedSuccess: "Your professional profile has been updated.",
    profileSaveError: "We couldn't save your profile at this time.",
    saveFailedAlert: "Could not sync stories.",
    removeButtonLabel: "Remove",
    
    // Common UI (Traveler)
    homeMorning: "Good morning",
    homeRecommended: "Recommended for you by AI",
    homeRefreshing: "Refreshing...",
    homeRefreshAI: "Refresh AI",
    homeLoadingRecommendations: "Loading recommendations...",
    homeRecommendationsError: "Could not load recommendations. Ensure backend and AI are running.",
    homeRefreshFailed: "Refresh failed.",
    homeOpenMap: "Open map",
    homeTripStyle: "Trip style",
    homePopularItineraries: "Popular itineraries in Sri Lanka",
    homeHiddenGems: "Hidden Gems & Off the Beaten Path",
    homeThrillingAdventures: "Thrilling Adventures",
    
    tripsTitle: "My Trips ✈️",
    tripsSubtitle: "Track and plan all your adventures",
    tripsNewTrip: "+ New Trip",
    tripsBackToTrips: "← Back to trips",
    tripsFilterAll: "All Trips",
    tripsFilterUpcoming: "Upcoming",
    tripsFilterActive: "Active",
    tripsFilterCompleted: "Completed",
    tripsLoading: "Loading your trips...",
    tripsNoSaved: "No trips saved yet",
    tripsNoSavedDesc: "Click \"New Trip\" to start planning your adventure!",
    tripsNoCategory: "No trips in this category.",
    tripsShowAll: "Show all trips",
    
    profileTravelerQuests: "Traveler Quests",
    profileTravelerQuestsDesc: "View and complete available quests to earn rewards!",
    profileViewQuests: "View Quests",
    
    questsTitle: "Quests & Challenges",
    questsSubtitle: "Complete these quests to earn rewards and upgrade your traveler status!",
    questsLoading: "Loading quests...",
    questsEmpty: "No quests available right now. Check back later!",
    questsCompleted: "✓ Completed",
    questsCompleting: "Completing...",
    questsCompleteQuest: "Complete Quest",
    
    communityTitle: "Community 🌐",
    communitySubtitle: "Connect with fellow travelers",
    
    settingsTitle: "Settings",
    settingsSubtitle: "Manage your account preferences and application experience.",
    appearanceTitle: "Appearance",
    appearanceDesc: "Customize how Ride-Lanka looks on your device.",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    languageTitle: "Language",
    languageDesc: "Select your preferred language for the interface.",
    notificationsTitle: "Notifications",
    notificationsDesc: "Control which alerts you want to receive.",
    emailNotificationsTitle: "Email Notifications",
    emailNotificationsDesc: "Receive trip summaries and recommendations via email.",
    pushNotificationsTitle: "Push Notifications",
    pushNotificationsDesc: "Get real-time alerts for travel updates and badges.",
    privacyTitle: "Security & Privacy",
    privacyDesc: "Manage your account visibility and data tracking.",
    publicProfileTitle: "Public Profile",
    publicProfileDesc: "Allow others to see your traveler level and badges.",
    activityTrackingTitle: "Activity Tracking",
    activityTrackingDesc: "Use your travel behavior to improve AI recommendations.",
    notificationsEmpty: "No new notifications.",
    
    wishlistTitle: "My Wishlist",
    wishlistPlacesSaved: "places saved",
    wishlistEmptyTitle: "Your wishlist is empty",
    wishlistEmptyDesc: "Press the heart button on any destination in Home or Explore to save it here.",
    wishlistRemoveTitle: "Remove from Wishlist",

    detailBackToExplore: "← Back to Explore",
    detailBookNow: "Book Now",
    detailAddToWishlist: "Add to Wishlist ❤️",

    guidesTitle: "Tour guides",
    guidesSubtitle: "Find a local expert for culture, adventure, food, and more.",
    guidesSearch: "Search",
    guidesSearchPh: "Name, area, or specialty…",
    guidesFilterExpertise: "Experience type",
    guidesMinRating: "Minimum rating",
    guidesAnyRating: "Any",
    guidesLoading: "Loading guides…",
    guidesEmptyTitle: "No guides yet",
    guidesEmptyDesc: "Be the first to list your services in Guide hub, or widen your filters.",
    guidesViewProfile: "View profile",
    guidesBackToList: "← Back to tour guides",
    guidesNotFound: "This guide profile could not be loaded.",
    guidesLanguages: "Languages",
    guidesYearsExp: "Years of experience",
    guidesCerts: "Certifications",
    guidesAvailability: "Availability",
    guidesHighlights: "Tour highlights",
    guidesGallery: "Photos",
    guidesVideos: "Videos",
    guidesStories: "Stories & posts",
    guidesReviewsTitle: "Reviews",
    guidesNoReviews: "No reviews yet.",
    guidesReviews: "reviews",
    guidesLeaveReview: "Write a review",
    guidesRating: "Rating",
    guidesReviewText: "Your experience",
    guidesSubmitReview: "Submit review",
    guidesReviewThanks: "Thanks for your review.",
    guidesReviewFailed: "Could not submit review.",
    guidesRequestBooking: "Request a booking",
    guidesSignInToBook: "Sign in to send a booking request.",
    guidesOwnProfile: "This is your guide profile.",
    guidesBookingFillRequired: "Please add a date and destination.",
    guidesBookingSent: "Request sent. The guide will accept or decline in Guide hub.",
    guidesBookingFailed: "Could not send request.",
    guidesTourDate: "Date",
    guidesTourTime: "Time",
    guidesDestination: "Destination / meeting point",
    guidesPartySize: "Travelers",
    guidesMessage: "Message to guide",
    guidesMessagePh: "Interests, pace, accessibility…",
    guidesSending: "Sending…",
    guidesSendRequest: "Send request",
    guidesNoIncoming: "No pending booking requests.",
    guidesNoOutgoing: "You have not requested any guides yet.",
    guidesAccept: "Accept",
    guidesReject: "Decline",
    guidesPastBookings: "Other bookings",
    expCulture: "Culture",
    expAdventure: "Adventure",
    expHistory: "History",
    expFood: "Food",
    expNature: "Nature",
    expWildlife: "Wildlife",
    langEnglish: "English",
    langSinhala: "Sinhala",
    langTamil: "Tamil",
    langFrench: "French",
    langGerman: "German",
    langChinese: "Chinese",
    langJapanese: "Japanese",
    langRussian: "Russian",
    langItalian: "Italian",
    langSpanish: "Spanish"
  },
  si: {
    // App Roles & Branding
    appRoleTripPlanner: "සංචාර සැලසුම්කරු",
    appRoleExplorerPro: "ගවේෂක · ප්‍රෝ",
    appRoleTourGuide: "සංචාරක මාර්ගෝපදේශක",
    authBrandTagline: "සැලසුම් · ගවේෂණය · මතක.",
    
    // Auth Screens
    splashTitleLine1: "සිහින දකින්න සූදානම්ද?",
    splashTitleLine2: "අපි සංචාරය කරමු.",
    splashSubtitle: "අලංකාර ගමනාන්ත සොයා, අමතක නොවන සංචාර සැලසුම් කර, ගවේෂකයන්ගේ ගෝලීය ප්‍රජාව සමඟ සම්බන්ධ වන්න.",
    splashGetStarted: "ආරම්භ කරන්න",
    splashSignIn: "පිවිසෙන්න",
    splashGuideLogin: "මාර්ගෝපදේශ පිවිසීම",
    authGuideBanner: "ඔබ සංචාරක මාර්ගෝපදේශ ද්වාරයට පිවිසෙමින් සිටී.",
    authHeroTitleLine1: "සෑම ගමනක්ම ආරම්භ වන්නේ",
    authHeroTitleLine2: "එක් පියවරකින්.",
    authHeroSubtitle: "DreamTrip සමඟ තම සිහින සංචාර සැලසුම් කරන මිලියන ගණනක් සංචාරකයන්ට එක්වන්න.",
    authSignInTab: "පිවිසෙන්න",
    authCreateAccountTab: "ගිණුම සාදන්න",
    authTablistAria: "පිවිසීම හෝ ගිණුමක් සාදීම",
    authInterestHint: "ඔබට උද්යෝගය දනවන දේ තට්ටු කරන්න — එකක් වත් තෝරන්න.",
    
    loginWelcomeBack: "නැවත සාදරයෙන් පිළිගනිමු!",
    loginSubtitle: "ඔබේ සංචාරක ගමන දිගටම කරගෙන යාමට පිවිසෙන්න",
    loginEmailLabel: "ඊමේල් ලිපිනය",
    loginPasswordLabel: "මුරපදය",
    loginForgotPassword: "මුරපදය අමතකද?",
    loginSigningIn: "පිවිසෙමින්...",
    loginSignIn: "පිවිසෙන්න",
    loginErrorEmpty: "කරුණාකර ඔබේ ඊමේල් සහ මුරපදය ඇතුළත් කරන්න.",
    loginErrorFailed: "පිවිසීම අසාර්ථකයි. ඔබේ විස්තර පරීක්ෂා කරන්න.",
    
    signupTitle: "ඔබේ ගිණුම සාදන්න",
    signupSubtitle: "ඔබගේ ශ්‍රී ලංකා සංචාරය සැලසුම් කිරීම ආරම්භ කරන්න",
    signupFullName: "සම්පූර්ණ නම",
    signupNext: "ඊළඟ",
    signupInterestsTitle: "ඔබේ රුචිකතා තෝරන්න",
    signupInterestsSubtitle: "AI නිර්දේශ සඳහා මෙය අපි භාවිත කරමු.",
    signupCreating: "ගිණුම සාදමින්...",
    signupCreateAccount: "ගිණුම සාදන්න",
    signupBack: "ආපසු",
    signupErrorSelectInterest: "කරුණාකර අවම වශයෙන් එක් රුචිකතාවක් තෝරන්න.",
    signupErrorFailed: "ගිණුම සෑදීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
    signupErrorFillAll: "කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න.",
    signupErrorPasswordLen: "මුරපදය අක්ෂර 6ක්වත් විය යුතුය.",
    
    catFood: "දේශීය ආහාර",
    catFamily: "පවුලේ සැමට",
    
    // Main Navigation (Sidebar)
    navHome: "මුල් පිටුව",
    navExplore: "ගවේෂණය",
    navTourGuides: "සංචාරක මාර්ගෝපදේශ",
    navMyTrips: "මගේ සංචාර",
    navWishlist: "පැතුම් ලැයිස්තුව",
    navProfile: "පැතිකඩ",
    navNotifications: "දැනුම්දීම්",
    navSettings: "සැකසුම්",
    navGuideDashboard: "උපකරණ පුවරුව",
    navGuideBookings: "වෙන්කිරීම් ඉල්ලීම්",
    navGuideStories: "කතා සහ ලිපි",
    navDiscover: "සොයා බලන්න",
    navTripsLabel: "සංචාර",
    navAccountLabel: "ගිණුම",
    navGuidePortalLabel: "මාර්ගෝපදේශ ද්වාරය",
    catBeach: "වෙරළ",
    catHill: "කඳුකර",
    catCultural: "සංස්කෘතික",
    catNature: "සොබාදහම",
    
    // Guide Portal - General
    hubTitle: "මාර්ගෝපදේශ කේන්ද්‍රය",
    hubSubtitle: "ඔබේ වෘත්තීය පැතිකඩ, වෙන්කිරීම් ඉල්ලීම් සහ පුද්ගලික සංචාර කළමනාකරණය කරන්න.",
    bookingRequestsTitle: "වෙන්කිරීම් ඉල්ලීම්",
    bookingRequestsSubtitle: "ඔබේ ඉදිරි සංචාර වෙන්කිරීම් සහ සේවාදායක ඉල්ලීම් කළමනාකරණය කරන්න.",
    incomingRequestsTab: "පැමිණෙන ඉල්ලීම්",
    noIncomingRequests: "දැනට පොරොත්තු වෙන්කිරීම් ඉල්ලීම් නොමැත.",
    pastReservationsTitle: "පසුගිය වෙන්කිරීම්",
    acceptButton: "පිළිගන්න",
    declineButton: "ප්‍රතික්ෂේප කරන්න",
    travelersCountLabel: "සංචාරකයින්",
    myBookingRequestsTitle: "මගේ වෙන්කිරීම් ඉල්ලීම්",
    noTravelerBookings: "ඔබ තවමත් වෙන්කිරීම් ඉල්ලීම් කිසිවක් යවා නොමැත.",
    bookingStatusAccepted: "පිළිගත්",
    bookingStatusPending: "පොරොත්තු",
    bookingStatusRejected: "ප්‍රතික්ෂේප කළ",
    withGuideLabel: "සමඟ",
    editProfileHeader: "පොදු වෘත්තීය පැතිකඩ",
    listProfilePublicly: "සංචාරලයින්ට මගේ පැතිකඩ පෙන්වන්න",
    signInToAccessHub: "කරුණාකර ඔබගේ මාර්ගෝපදේශ කේන්ද්‍රයට පිවිසෙන්න.",
    
    // Guide Portal - Profile Form
    displayNameLabel: "පැතිකඩ නම",
    headlineLabel: "වෘත්තීය ශීර්ෂ පාඨය",
    headlinePlaceholder: "උදා: මහනුවර උරුම ඇවිදීම්",
    locationLabel: "පදනම් ස්ථානය",
    hourlyRateLabel: "පැයක ගාස්තුව (LKR)",
    languagesLabel: "භාෂා",
    expertiseLabel: "විශේෂතා සහ නිපුනතා",
    experienceYearsLabel: "මාර්ගෝපදේශන අත්දැකීම් වසර",
    bioLabel: "වෘත්තීය ජීව දත්ත",
    availabilityLabel: "පොදු ලබා ගත හැකි වේලාවන්",
    availabilityPlaceholder: "සති අන්ත, ආවරණ ප්‍රදේශ, කල්තබා දැනුම්දීම...",
    saveProfileButton: "පැතිකඩ සුරකින්න",
    
    // Profile Edit Screen (General)
    editProfileTitle: "පැතිකඩ සංස්කරණය",
    editProfileSubtitle: "ඔබේ තොරතුරු සහ ආරක්ෂක සැකසුම් යාවත්කාලීන කරන්න.",
    firstNameLabel: "පළමු නම",
    lastNameLabel: "අවසාන නම",
    dobLabel: "උපන් දිනය",
    phoneNumberLabel: "දුරකථන අංකය",
    emailLabel: "ඊමේල් ලිපිනය",
    passwordLabel: "නව මුරපදය",
    confirmPasswordLabel: "මුරපදය තහවුරු කරන්න",

    // Homepage
    homeTitle: "ශ්‍රී ලංකාව ඔබ එනතුරු බලා සිටී",
    homeMorning: "සුබ උදෑසනක්",
    homeAfternoon: "සුබ දහවලක්",
    homeEvening: "සුබ සන්ධ්‍යාවක්",
    homeRefreshing: "යාවත්කාලීන කරමින්...",
    homeRefreshAI: "AI යාවත්කාලීන කරන්න",
    homeRecommended: "AI මගින් ඔබ සඳහා නිර්දේශිතය",
    homeTripStyle: "සංචාරක විලාසය",
    homePopularItineraries: "ජනප්‍රිය සංචාරක ගමන් පථ",
    homeHiddenGems: "සැඟවුණු මැණික්",
    homeThrillingAdventures: "ත්‍රාසජනක අත්දැකීම්",
    homeOpenMap: "සිතියම විවෘත කරන්න",
    homeRecommendationsError: "නිර්දේශ පැටවීමට නොහැකි විය.",
    homeRefreshFailed: "යාවත්කාලීන කිරීම අසාර්ථක විය.",
    homeLoadingRecommendations: "AI ඔබේ පරිපූර්ණ ගමන් පථය සකසමින් පවතී...",
    bioPlaceholder: "ඔබ ගැන විස්තරයක් ඇතුළත් කරන්න...",
    saveButton: "සුරකින්න්න",
    cancelButton: "අවලංගු කරන්න",
    profileEdit: "සංස්කරණය",
    profileSignOut: "පිටවන්න",
    
    // Stories Feature
    writeNewStory: "නව කතාවක් ලියන්න",
    storyTitleLabel: "කතාවේ මාතෘකාව",
    storyTitlePlaceholder: "උදා: සීගිරිය අරුණේ සංචාරය",
    storyBodyLabel: "ඔබේ කතාව පවසන්න...",
    storyBodyPlaceholder: "ඔබේ අත්දැකීම සංචාරකයින් සමඟ බෙදාගන්න...",
    addStoryButton: "කතාව සුරකින්න",
    yourStoriesLabel: "මගේ එකතුව",
    saveAllStories: "සියල්ල ප්‍රකාශ කරන්න",
    noStoriesFound: "තවම කතා නැත. ලිවීම ආරම්භ කරන්න!",
    untitledStory: "මාතෘකාවක් නැති අත්දැකීමක්",
    storiesSavedHighlight: "ඔබේ කතා සුරක්ෂිත කරන ලදී.",
    
    // Status & Actions
    loadingData: "පූරණය වෙමින්...",
    savingProgress: "සුරකිමින්...",
    profileSavedSuccess: "ඔබේ වෘත්තීය පැතිකඩ යාවත්කාලීන කරන ලදී.",
    profileSaveError: "ඔබේ පැතිකඩ දැනට සුරකිය නොහැකි විය.",
    saveFailedAlert: "කතා සුරකිය නොහැකි විය.",
    removeButtonLabel: "ඉවත් කරන්න",
    
    // Common UI (Traveler)
    homeMorning: "සුභ උදෑසනක්",
    homeRecommended: "AI ඔබට නිර්දේශ කරයි",
    homeRefreshing: "යාවත්කාලීන වෙමින්...",
    homeRefreshAI: "AI යාවත්කාලීන කරන්න",
    homeLoadingRecommendations: "නිර්දේශ පූරණය වෙමින්...",
    homeRecommendationsError: "නිර්දේශ පූරණය කළ නොහැකි විය. Backend සහ AI ධාවනය වන බව තහවුරු කරන්න.",
    homeRefreshFailed: "යාවත්කාලීන කිරීම අසාර්ථකයි.",
    homeOpenMap: "සිතියම විවෘත කරන්න",
    homeTripStyle: "සංචාර ශෛලිය",
    homePopularItineraries: "ශ්‍රී ලංකාවේ ජනප්‍රිය සංචාර සැලසුම්",
    homeHiddenGems: "රහසිගත මැණික් සහ විශේෂ ස්ථාන",
    homeThrillingAdventures: "රසවත් ත්‍රාසජනක අත්දැකීම්",
    
    tripsTitle: "මගේ සංචාර ✈️",
    tripsSubtitle: "ඔබගේ සියලු ගමන් අත්දැකීම් සැලසුම් කර අධීක්ෂණය කරන්න",
    tripsNewTrip: "+ නව සංචාරයක්",
    tripsBackToTrips: "← සංචාර වෙත ආපසු",
    tripsFilterAll: "සියලු සංචාර",
    tripsFilterUpcoming: "ඉදිරියට ඇති",
    tripsFilterActive: "ක්‍රියාත්මක",
    tripsFilterCompleted: "සම්පූර්ණ",
    tripsLoading: "ඔබගේ සංචාර පූරණය වෙමින්...",
    tripsNoSaved: "තවම සංචාර සුරකිලා නැහැ",
    tripsNoSavedDesc: "\"නව සංචාරයක්\" ක්ලික් කර ආරම්භ කරන්න!",
    tripsNoCategory: "මෙම ප්‍රභේදයට සංචාර නොමැත.",
    tripsShowAll: "සියල්ල පෙන්වන්න",
    
    profileTravelerQuests: "සංචාරක කාර්යය",
    profileTravelerQuestsDesc: "ප්‍රතිලාභ ලබා ගැනීමට ලබාගත හැකි කාර්යයන් සම්පූර්ණ කරන්න!",
    profileViewQuests: "කාර්යයන් බලන්න",
    
    questsTitle: "කාර්යයන් සහ අභියෝග",
    questsSubtitle: "ප්‍රතිලාභ ලබාගෙන සංචාරක මට්ටම ඉහළ නැංවීමට කාර්යයන් සම්පූර්ණ කරන්න!",
    questsLoading: "කාර්යයන් පූරණය වෙමින්...",
    questsEmpty: "දැනට කාර්යයන් නොමැත. පසුව නැවත පරීක්ෂා කරන්න!",
    questsCompleted: "✓ සම්පූර්ණයි",
    questsCompleting: "සම්පූර්ණ කරමින්...",
    questsCompleteQuest: "කාර්යය සම්පූර්ණ කරන්න",
    
    communityTitle: "ප්‍රජාව 🌐",
    communitySubtitle: "සහ සංචාරකයින් සමඟ සම්බන්ධ වන්න",
    
    settingsTitle: "සැකසුම්",
    settingsSubtitle: "ඔබගේ ගිණුම් කැමැත්ත සහ යෙදුම් අත්දැකීම කළමනාකරණය කරන්න.",
    appearanceTitle: "පෙනුම",
    appearanceDesc: "ඔබගේ උපාංගයේ Ride-Lanka පෙනුම අභිරුචිකරණය කරන්න.",
    themeLight: "ආලෝක",
    themeDark: "අඳුරු",
    themeSystem: "පද්ධති",
    languageTitle: "භාෂාව",
    languageDesc: "අතුරුමුහුණත සඳහා ඔබ කැමති භාෂාව තෝරන්න.",
    notificationsTitle: "දැනුම්දීම්",
    notificationsDesc: "ඔබට ලැබිය යුතු දැනුම්දීම් පාලනය කරන්න.",
    emailNotificationsTitle: "ඊමේල් දැනුම්දීම්",
    emailNotificationsDesc: "ගමන් සාරාංශ සහ නිර්දේශ ඊමේල් හරහා ලබා ගන්න.",
    pushNotificationsTitle: "පුෂ් දැනුම්දීම්",
    pushNotificationsDesc: "ගමන් යාවත්කාලීන සහ බැජ් සඳහා තත්‍ය කාලීන දැනුම්දීම් ලබා ගන්න.",
    privacyTitle: "ආරක්ෂාව සහ පෞද්ගලිකත්වය",
    privacyDesc: "ගිණුම් දෘශ්‍යතාව සහ දත්ත නිරීක්ෂණය කළමනාකරණය කරන්න.",
    publicProfileTitle: "පොදු පැතිකඩ",
    publicProfileDesc: "අන් අයට ඔබේ සංචාරක මට්ටම සහ බැජ් දැකීමට ඉඩ දෙන්න.",
    activityTrackingTitle: "ක්‍රියාකාරකම් නිරීක්ෂණය",
    activityTrackingDesc: "AI නිර්දේශ වැඩිදියුණු කිරීමට ඔබගේ ගමන් හැසිරීම භාවිත කරන්න.",
    notificationsEmpty: "නව දැනුම්දීම් නොමැත.",
    
    wishlistTitle: "මගේ පැතුම් ලැයිස්තුව",
    wishlistPlacesSaved: "ස්ථාන සුරකින ලදී",
    wishlistEmptyTitle: "ඔබේ පැතුම් ලැයිස්තුව හිස්ය",
    wishlistEmptyDesc: "මෙහි සුරැකීමට Home හෝ Explore හි ඕනෑම ගමනාන්තයක හදවත බොත්තම ඔබන්න.",
    wishlistRemoveTitle: "පැතුම් ලැයිස්තුවෙන් ඉවත් කරන්න",

    detailBackToExplore: "← ගවේෂණය වෙත ආපසු",
    detailBookNow: "දැන් වෙන්කරන්න",
    detailAddToWishlist: "පැතුම් ලැයිස්තුවට එක් කරන්න ❤️",

    guidesTitle: "සංචාරක මාර්ගෝපදේශ",
    guidesSubtitle: "සංස්කෘතිය, ත්‍රාසය, ආහාර සහ තවත් දේ සඳහා දේශීය විශේෂඥයෙක් සොයන්න.",
    guidesSearch: "සොයන්න",
    guidesSearchPh: "නම, ප්‍රදේශය, විශේෂතාව…",
    guidesFilterExpertise: "අත්දැකීම් වර්ගය",
    guidesMinRating: "අවම ශ්‍රේණිගත කිරීම",
    guidesAnyRating: "ඕනෑම",
    guidesLoading: "මාර්ගෝපදේශ පූරණය වෙමින්…",
    guidesEmptyTitle: "තවම මාර්ගෝපදේශ නැත",
    guidesEmptyDesc: "මාර්ගෝපදේශ කේන්ද්‍රයෙන් ලැයිස්තුගත වීමට ප්‍රථම වන්න, හෝ පෙරහන් පුළුල් කරන්න.",
    guidesViewProfile: "පැතිකඩ බලන්න",
    guidesBackToList: "← සංචාරක මාර්ගෝපදේශ වෙත",
    guidesNotFound: "මෙම මාර්ගෝපදේශ පැතිකඩ පූරණය කළ නොහැක.",
    guidesLanguages: "භාෂා",
    guidesYearsExp: "වසර ගණනාවක අත්දැකීම",
    guidesCerts: "සහතික",
    guidesAvailability: "ලබා ගත හැකි වේලාවන්",
    guidesHighlights: "සංචාර ඉසව්",
    guidesGallery: "ඡායාරූප",
    guidesVideos: "වීඩියෝ",
    guidesStories: "කතා සහ ලිපි",
    guidesReviewsTitle: "සමාලෝචන",
    guidesNoReviews: "තවම සමාලෝචන නැත.",
    guidesReviews: "සමාලෝචන",
    guidesLeaveReview: "සමාලෝචනයක් ලියන්න",
    guidesRating: "ශ්‍රේණිගත කිරීම",
    guidesReviewText: "ඔබේ අත්දැකීම",
    guidesSubmitReview: "සමාලෝචනය යොමු කරන්න",
    guidesReviewThanks: "ඔබගේ සමාලෝචනයට ස්තූතියි.",
    guidesReviewFailed: "සමාලෝචනය යැවිය නොහැකි විය.",
    guidesRequestBooking: "වෙන්කිරීමක් ඉල්ලන්න",
    guidesSignInToBook: "ඉල්ලීමක් යැවීමට පිවිසෙන්න.",
    guidesOwnProfile: "මෙය ඔබේ මාර්ගෝපදේශ පැතිකඩයි.",
    guidesBookingFillRequired: "කරුණාකර දිනය සහ ගමනාන්තය එක් කරන්න.",
    guidesBookingSent: "ඉල්ලීම යැවිණි. මාර්ගෝපදේශයා මාර්ගෝපදේශ කේන්ද්‍රයෙන් පිළිගනී හෝ ප්‍රතික්ෂේප කරයි.",
    guidesBookingFailed: "ඉල්ලීම යැවිය නොහැකි විය.",
    guidesTourDate: "දිනය",
    guidesTourTime: "වේලාව",
    guidesDestination: "ගමනාන්තය / හමුවීමේ ස්ථානය",
    guidesPartySize: "සංචාරකයින්",
    guidesMessage: "මාර්ගෝපදේශයාට පණිවිඩය",
    guidesMessagePh: "රුචිකතා, වේගය, ප්‍රවේශය…",
    guidesSending: "යවමින්…",
    guidesSendRequest: "ඉල්ලීම යවන්න",
    guidesNoIncoming: "පොරොත්තු වෙන්කිරීම් ඉල්ලීම් නැත.",
    guidesNoOutgoing: "තවම මාර්ගෝපදේශ ඉල්ලීම් නැත.",
    guidesAccept: "පිළිගන්න",
    guidesReject: "ප්‍රතික්ෂේප කරන්න",
    guidesPastBookings: "වෙනත් වෙන්කිරීම්",
    expCulture: "සංස්කෘතිය",
    expAdventure: "ත්‍රාසජනක",
    expHistory: "ඉතිහාසය",
    expFood: "ආහාර",
    expNature: "සොබාදහම",
    expWildlife: "වනජීවී",
    langEnglish: "ඉංග්‍රීසි",
    langSinhala: "සිංහල",
    langTamil: "දෙමළ",
    langFrench: "ප්‍රංශ",
    langGerman: "ජර්මන්",
    langChinese: "චීන",
    langJapanese: "ජපන්",
    langRussian: "රුසියානු",
    langItalian: "ඉතාලි",
    langSpanish: "ස්පාඤ්ඤ"
  },
  ta: {
    // Main Navigation (Sidebar)
    navHome: "முகப்பு",
    navExplore: "ஆராயுங்கள்",
    navTourGuides: "சுற்றுலா வழிகாட்டிகள்",
    navMyTrips: "எனது பயணங்கள்",
    navWishlist: "விருப்பப்பட்டியல்",
    navProfile: "சுயவிவரம்",
    navNotifications: "அறிவிப்புகள்",
    navSettings: "அமைப்புகள்",
    navGuideDashboard: "டாஷ்போர்டு",
    navGuideBookings: "பதிவு கோரிக்கைகள்",
    navGuideStories: "கதைகள் / பதிவுகள்",
    navDiscover: "கண்டுபிடி",
    navTripsLabel: "பயணங்கள்",
    navAccountLabel: "கணக்கு",
    navGuidePortalLabel: "வழிகாட்டி போர்டல்",
    catBeach: "கடற்கரை",
    catHill: "மலை நாடு",
    catCultural: "கலாச்சாரம்",
    catNature: "இயற்கை",
    catFood: "உணவு",
    catFamily: "குடும்பம்",

    // Home Screen
    homeTitle: "Ride-Lanka ஐ ஆராயுங்கள்",
    homeMorning: "காலை வணக்கம்",
    homeRecommended: "AI பரிந்துரைகள்",
    homeRefreshAI: "புதுப்பிக்கவும்",
    homeTripStyle: "பயண பாணி",
    homePopularItineraries: "பிரபலமான பயணங்கள்",
    homeHiddenGems: "மறைக்கப்பட்ட இடங்கள்",
    homeThrillingAdventures: "சாகசங்கள்",
    homeOpenMap: "வரைபடத்தைத் திற",

    // Settings
    settingsTitle: "அமைப்புகள்",
    settingsLanguage: "மொழி",
    settingsTheme: "தோற்றம்",
    themeLight: "ஒளி",
    themeDark: "இருள்",
    themeSystem: "கணினி",
    settingsNotifications: "அறிவிப்புகள்",
    settingsPrivacy: "தனியுரிமை",
    settingsSave: "சேமி",
    settingsSaving: "சேமிக்கப்படுகிறது...",
    settingsSaved: "சேமிக்கப்பட்டது",

    // Expertise & Languages (Tamil)
    expCulture: "கலாச்சாரம்",
    expAdventure: "சாகசம்",
    expHistory: "வரலாறு",
    expFood: "உணவு",
    expNature: "இயற்கை",
    expWildlife: "வனவிலங்கு",
    langEnglish: "ஆங்கிலம்",
    langSinhala: "சிங்களம்",
    langTamil: "தமிழ்",
    langFrench: "பிரஞ்சு",
    langGerman: "ஜெர்மன்",
    langChinese: "சீனம்",
    langJapanese: "ஜப்பானிய",
    langRussian: "ருஷியன்",
    langItalian: "இத்தாலியன்",
    langSpanish: "ஸ்பானிஷ்",

    // Profile Labels
    appRoleTripPlanner: "பயண திட்டமிடுபவர்",
    appRoleExplorerPro: "ஆய்வாளர்",
    appRoleTourGuide: "சுற்றுலா வழிகாட்டி"
  },
};

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState("system"); // light, dark, system
  const [language, setLanguage] = useState("en"); // en, si, ta
  const [notifications, setNotifications] = useState({
    email: true,
    push: true
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    tracking: true
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ride-lanka-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.privacy) setPrivacy(parsed.privacy);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Save to localStorage and apply theme
  useEffect(() => {
    localStorage.setItem("ride-lanka-settings", JSON.stringify({
      theme, language, notifications, privacy
    }));

    // Apply dark mode class to html
    const root = window.document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Keep browser language metadata in sync with selected app language.
    root.setAttribute("lang", language);
    root.setAttribute("dir", "ltr");
  }, [theme, language, notifications, privacy]);

  useEffect(() => {
    if (theme !== "system") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const root = window.document.documentElement;
      if (media.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const t = (key) => TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <SettingsContext.Provider value={{ 
      theme, setTheme, 
      language, setLanguage, 
      t,
      notifications, setNotifications,
      privacy, setPrivacy 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
}
