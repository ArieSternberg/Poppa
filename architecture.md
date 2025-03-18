# Application Architecture

## System Overview
This document outlines the architecture of the medical tracking application (Poppa.AI), including all major components and their interactions.

## Installation for Viewing
To view the architecture diagram in VS Code:
1. Install the "Markdown Preview Mermaid Support" extension
2. Open this file in VS Code
3. Press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac) to open the preview
4. The diagram will render automatically

## Architecture Diagram

```mermaid
graph TD
    subgraph Visitor_Flow
        User((User))
        User -->|Visits| LandingPage[Landing Page]
        LandingPage -->|Clicks Get Started| SignUp[Sign Up]
        LandingPage -->|Clicks Sign In| SignIn[Sign In]
    end

    subgraph Authentication_Flow
        SignUp -->|Clerk Auth| CreateClerkAccount[Create Clerk Account]
        SignIn -->|Clerk Auth| ValidateClerkUser[Validate Clerk User]
        
        CreateClerkAccount -->|Success| CreateNeo4jUser[Create Neo4j User]
        ValidateClerkUser -->|Success| FetchNeo4jUser[Fetch Neo4j User]
        
        CreateNeo4jUser -->|New User| OnboardingFlow
        FetchNeo4jUser -->|Existing User| DashboardFlow
    end

    subgraph OnboardingFlow[Onboarding Flow]
        OnboardingModal[Onboarding Modal]
        UserProfile[User Profile]
        MedicationSearch[Medication Search]
        MedicationDetails[Medication Details]
        MedicationSchedule[Medication Schedule]
        
        OnboardingModal -->|Start| UserProfile
        UserProfile -->|Next| MedicationSearch
        MedicationSearch -->|Select| MedicationDetails
        MedicationDetails -->|Configure| MedicationSchedule
        MedicationSchedule -->|Complete| DashboardFlow
    end

    subgraph DashboardFlow[Dashboard Features]
        Dashboard[Dashboard]
        TodaySchedule[Today's Schedule]
        MedicationManagement[Medication Management]
        ActivityLogs[Activity Logs]
        
        Dashboard -->|View| TodaySchedule
        Dashboard -->|Manage| MedicationManagement
        Dashboard -->|Track| ActivityLogs
    end

    subgraph Notification_System
        NotificationTypes{Notification Types}
        NotificationsAPI["API: /notifications"]
        TwilioWebhookAPI["API: /webhook/twilio"]
        
        NotificationTypes -->|Welcome Elder| NotificationsAPI
        NotificationTypes -->|Welcome Caretaker| NotificationsAPI
        NotificationTypes -->|Medication Reminder| NotificationsAPI
        NotificationTypes -->|Unregistered User| NotificationsAPI
        NotificationTypes -->|Invite Family| NotificationsAPI
        
        NotificationsAPI -->|Send| TwilioService[Twilio Service]
        TwilioService -->|Deliver| WhatsApp[WhatsApp Messages]
        WhatsApp -->|Response| TwilioWebhookAPI
        TwilioWebhookAPI -->|Check User| Neo4jDB[(Neo4j DB)]
        
        Dashboard -->|Trigger| NotificationsAPI
    end

    subgraph Database
        Neo4jDB[(Neo4j DB)]
        ClerkDB[(Clerk Auth DB)]
        
        CreateNeo4jUser -->|Store| Neo4jDB
        FetchNeo4jUser -->|Query| Neo4jDB
        MedicationManagement -->|CRUD| Neo4jDB
        ActivityLogs -->|Record| Neo4jDB
    end

    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Dashboard fill:#bbf,stroke:#333,stroke-width:2px
    style TwilioService fill:#bfb,stroke:#333,stroke-width:2px
    style Neo4jDB fill:#fbb,stroke:#333,stroke-width:2px
    style ClerkDB fill:#fbf,stroke:#333,stroke-width:2px
```

## Component Breakdown

### Authentication System
- **Clerk Authentication**: Handles user signup, signin, and session management
- **Neo4j User Store**: Stores user profiles and relationships
- **Auth Flow**: Clerk → Neo4j user creation/validation

### Notification System
- **Types**:
  - Welcome Elder
  - Welcome Caretaker
  - Medication Reminder
  - Unregistered User
  - Invite Family (Two-step)
- **API Endpoints**:
  - `/api/notifications/*`: Handles notification sending
  - `/api/webhook/twilio`: Processes WhatsApp responses
- **Twilio Integration**: WhatsApp message delivery

### Database Structure
- **Clerk DB**: User authentication and sessions
- **Neo4j DB**: 
  - User profiles
  - Medications
  - Schedules
  - Relationships
  - Activity logs

## Key Workflows

1. **Authentication Flow**
   - User signs up/in through Clerk
   - Clerk validates credentials
   - Neo4j user created/fetched
   - Route to onboarding or dashboard

2. **Notification Flow**
   - System triggers notification
   - API formats message
   - Twilio delivers WhatsApp message
   - User responds via WhatsApp
   - Webhook processes response
   - Neo4j records interaction

3. **Medication Management**
   - CRUD operations in Neo4j
   - Schedule tracking
   - Notification triggers
   - Activity logging 