import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="mb-4">Last updated January 15, 2025</p>
          <p className="mb-4">
            This Privacy Notice for Poppa Services Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access,
            collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services
            (&quot;Services&quot;), including when you:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              Visit our website at https://www.poppacare.com or any website of ours that links to this Privacy Notice
            </li>
            <li>
              Connect through our mobile web application (Poppacare.com), or any other application of ours that links to
              this Privacy Notice
            </li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Questions or concerns?</h2>
          <p className="mb-4">
            Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for
            making decisions about how your personal information is processed. If you don&apos;t agree with our policies and
            practices, please don&apos;t use our Services. If you still have any questions or concerns, please contact us at
            info@poppacare.com
          </p>

          <h2 className="text-2xl font-semibold mb-4">Summary of Key Points</h2>
          <p className="mb-4">
            This summary provides key points from our Privacy Notice, but you can find out more details about any of
            these topics by clicking the link following each key point or by using our table of contents below to find
            the section you are looking for.
          </p>

          <h3 className="text-xl font-semibold mb-2">What personal information do we process?</h3>
          <p className="mb-4">
            When you visit, use, or navigate our Services, we may process personal information depending on how you
            interact with us and the Services, the choices you make, and the products and features you use. Learn more
            about the personal information you disclose to us.
          </p>

          <h3 className="text-xl font-semibold mb-2">Do we collect any information from third parties?</h3>
          <p className="mb-4">
            We may collect information from public databases, marketing partners, social media platforms, and other
            outside sources. Learn more about information collected from other sources.
          </p>

          <h3 className="text-xl font-semibold mb-2">How do we process your information?</h3>
          <p className="mb-4">
            <em>
              In Short: We process your information to provide, improve, and administer our Services, communicate with
              you, for security and fraud prevention, and to comply with law. We may also process your information for
              other purposes with your consent.
            </em>
          </p>
          <p className="mb-4">
            We process your personal information for a variety of reasons, depending on how you interact with our
            Services, including:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              To facilitate account creation and authentication and otherwise manage user accounts. We may process
              your information so you can create and log in to your account, as well as keep your account in working
              order.
            </li>
            <li>
              To deliver and facilitate delivery of services to the user. We may process your information to provide
              you with the requested service.
            </li>
            <li>
              To respond to user inquiries/offer support to users. We may process your information to respond to your
              inquiries and solve any potential issues you might have with the requested service.
            </li>
            <li>
              To enable user-to-user communications. We may process your information if you choose to use any of our
              offerings that allow for communication with another user.
            </li>
            <li>
              To request feedback. We may process your information when necessary to request feedback and to contact
              you about your use of our Services.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">
            In what situations and with which parties do we share personal information?
          </h3>
          <p className="mb-4">
            We may share information in specific situations and with specific third parties. Learn more about when and
            with whom we share your personal information.
          </p>

          <h3 className="text-xl font-semibold mb-2">How do we keep your information safe?</h3>
          <p className="mb-4">
            We have adequate organizational and technical processes and procedures in place to protect your personal
            information. However, no electronic transmission over the internet or information storage technology can be
            guaranteed to be 100% secure. We cannot promise or guarantee that hackers, cybercriminals, or other
            unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or
            modify your information. Learn more about how we keep your information safe.
          </p>

          <h3 className="text-xl font-semibold mb-2">What are your rights?</h3>
          <p className="mb-4">
            Depending on where you are located geographically, the applicable privacy law may mean you have certain
            rights regarding your personal information. Learn more about your privacy rights.
          </p>

          <h3 className="text-xl font-semibold mb-2">How do you exercise your rights?</h3>
          <p className="mb-4">
            The easiest way to exercise your rights is by visiting https://www.poppacare.com/terms, or by contacting us.
            We will consider and act upon any request in accordance with applicable data protection laws.
          </p>

          <p className="mb-4">
            Want to learn more about what we do with any information we collect? Review the Privacy Notice in full.
          </p>

          <h2 className="text-2xl font-semibold mb-4">TABLE OF CONTENTS</h2>
          <ol className="list-decimal list-inside mb-4">
            <li>
              <a href="#section1" className="text-primary hover:underline">
                WHAT INFORMATION DO WE COLLECT?
              </a>
            </li>
            <li>
              <a href="#section2" className="text-primary hover:underline">
                HOW DO WE PROCESS YOUR INFORMATION?
              </a>
            </li>
            <li>
              <a href="#section3" className="text-primary hover:underline">
                WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
              </a>
            </li>
            <li>
              <a href="#section4" className="text-primary hover:underline">
                DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
              </a>
            </li>
            <li>
              <a href="#section5" className="text-primary hover:underline">
                DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?
              </a>
            </li>
            <li>
              <a href="#section6" className="text-primary hover:underline">
                HOW DO WE HANDLE YOUR SOCIAL LOGINS?
              </a>
            </li>
            <li>
              <a href="#section7" className="text-primary hover:underline">
                HOW LONG DO WE KEEP YOUR INFORMATION?
              </a>
            </li>
            <li>
              <a href="#section8" className="text-primary hover:underline">
                HOW DO WE KEEP YOUR INFORMATION SAFE?
              </a>
            </li>
            <li>
              <a href="#section9" className="text-primary hover:underline">
                DO WE COLLECT INFORMATION FROM MINORS?
              </a>
            </li>
            <li>
              <a href="#section10" className="text-primary hover:underline">
                WHAT ARE YOUR PRIVACY RIGHTS?
              </a>
            </li>
            <li>
              <a href="#section11" className="text-primary hover:underline">
                CONTROLS FOR DO-NOT-TRACK FEATURES
              </a>
            </li>
            <li>
              <a href="#section12" className="text-primary hover:underline">
                DO WE MAKE UPDATES TO THIS NOTICE?
              </a>
            </li>
            <li>
              <a href="#section13" className="text-primary hover:underline">
                HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
              </a>
            </li>
            <li>
              <a href="#section14" className="text-primary hover:underline">
                HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
              </a>
            </li>
          </ol>

          <section id="section1">
            <h2 className="text-2xl font-semibold mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
            <h3 className="text-xl font-semibold mb-2">Personal information you disclose to us</h3>
            <p className="mb-4">
              <em>In Short: We collect personal information that you provide to us.</em>
            </p>
            <p className="mb-4">
              We collect personal information that you voluntarily provide to us when you register on the Services,
              express an interest in obtaining information about us or our products and Services, when you participate
              in activities on the Services, or otherwise when you contact us.
            </p>
            <h4 className="text-lg font-semibold mb-2">Personal Information Provided by You.</h4>
            <p className="mb-4">
              The personal information that we collect depends on the context of your interactions with us and the
              Services, the choices you make, and the products and features you use. The personal information we collect
              may include the following:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>names</li>
              <li>phone numbers</li>
              <li>email addresses</li>
              <li>usernames</li>
              <li>passwords</li>
              <li>contact preferences</li>
              <li>contact or authentication data</li>
              <li>billing addresses</li>
              <li>debit/credit card numbers</li>
              <li>medications</li>
            </ul>
            <h4 className="text-lg font-semibold mb-2">Social Media Login Data.</h4>
            <p className="mb-4">
              We may provide you with the option to register with us using your existing social media account details,
              like your Facebook, X, or other social media account. If you choose to register in this way, we will
              collect certain profile information about you from the social media provider, as described in the section
              called "HOW DO WE HANDLE YOUR SOCIAL LOGINS?" below.
            </p>
            <h4 className="text-lg font-semibold mb-2">Application Data.</h4>
            <p className="mb-4">
              If you use our application(s), we also may collect the following information if you choose to provide us
              with access or permission:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                <strong>Push Notifications.</strong> We may request to send you push notifications regarding your
                account or certain features of the application(s). If you wish to opt out from receiving these types of
                communications, you may turn them off in your device's settings.
              </li>
            </ul>
            <p className="mb-4">
              This information is primarily needed to maintain the security and operation of our application(s), for
              troubleshooting, and for our internal analytics and reporting purposes.
            </p>
            <p className="mb-4">
              All personal information that you provide to us must be true, complete, and accurate, and you must notify
              us of any changes to such personal information.
            </p>
            <h3 className="text-xl font-semibold mb-2">Information automatically collected</h3>
            <p className="mb-4">
              <em>
                In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device
                characteristics — is collected automatically when you visit our Services.
              </em>
            </p>
            <p className="mb-4">
              We automatically collect certain information when you visit, use, or navigate the Services. This
              information does not reveal your specific identity (like your name or contact information) but may include
              device and usage information, such as your IP address, browser and device characteristics, operating
              system, language preferences, referring URLs, device name, country, location, information about how and
              when you use our Services, and other technical information. This information is primarily needed to
              maintain the security and operation of our Services, and for our internal analytics and reporting
              purposes.
            </p>
            <p className="mb-4">
              Like many businesses, we also collect information through cookies and similar technologies. You can find
              out more about this in our Cookie Notice: http://www.poppacare.com/cookies.
            </p>
            <p className="mb-4">The information we collect includes:</p>
            <ul className="list-disc list-inside mb-4">
              <li>
                <strong>Log and Usage Data.</strong> Log and usage data is service-related, diagnostic, usage, and
                performance information our servers automatically collect when you access or use our Services and which
                we record in log files. Depending on how you interact with us, this log data may include your IP
                address, device information, browser type, and settings and information about your activity in the
                Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and
                other actions you take such as which features you use), device event information (such as system
                activity, error reports (sometimes called &quot;crash dumps&quot;), and hardware settings).
              </li>
              <li>
                <strong>Location Data.</strong> We collect location data such as information about your device&apos;s
                location, which can be either precise or imprecise. How much information we collect depends on the type
                and settings of the device you use to access the Services. For example, we may use GPS and other
                technologies to collect geolocation data that tells us your current location (based on your IP address).
                You can opt out of allowing us to collect this information either by refusing access to the information
                or by disabling your Location setting on your device. However, if you choose to opt out, you may not be
                able to use certain aspects of the Services.
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-2">Information collected from other sources</h3>
            <p className="mb-4">
              <em>
                In Short: We may collect limited data from public databases, marketing partners, social media platforms,
                and other outside sources.
              </em>
            </p>
            <p className="mb-4">
              In order to enhance our ability to provide relevant marketing, offers, and services to you and update our
              records, we may obtain information about you from other sources, such as public databases, joint marketing
              partners, affiliate programs, data providers, social media platforms, and from other third parties. This
              information includes mailing addresses, job titles, email addresses, phone numbers, intent data (or user
              behavior data), Internet Protocol (IP) addresses, social media profiles, social media URLs, and custom
              profiles, for purposes of targeted advertising and event promotion.
            </p>
            <p className="mb-4">
              If you interact with us on a social media platform using your social media account (e.g., Facebook or X),
              we receive personal information about you from such platforms such as your name, email address, and
              gender. You may have the right to withdraw your consent to processing your personal information. Learn
              more about withdrawing your consent. Any personal information that we collect from your social media
              account depends on your social media account&apos;s privacy settings. Please note that their own use of your
              information is not governed by this Privacy Notice.
            </p>
            <p className="mb-4">
              Information collected when you use our Facebook application(s). We by default access your Facebook basic
              account information, including your name, email, gender, birthday, current city, and profile picture URL,
              as well as other information that you choose to make public.
            </p>
            <p className="mb-4">
              We may also request access to other permissions related to your account, such as friends, check-ins, and
              likes, and you may choose to grant or deny us access to each individual permission. For more information
              regarding Facebook permissions, refer to the Facebook Permissions Reference page.
            </p>
          </section>

          <section id="section2">
            <h2 className="text-2xl font-semibold mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
            <p className="mb-4">
              <em>
                In Short: We process your information to provide, improve, and administer our Services, communicate with
                you, for security and fraud prevention, and to comply with law. We may also process your information for
                other purposes with your consent.
              </em>
            </p>
            <p className="mb-4">
              We process your personal information for a variety of reasons, depending on how you interact with our
              Services, including:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                To facilitate account creation and authentication and otherwise manage user accounts. We may process
                your information so you can create and log in to your account, as well as keep your account in working
                order.
              </li>
              <li>
                To deliver and facilitate delivery of services to the user. We may process your information to provide
                you with the requested service.
              </li>
              <li>
                To respond to user inquiries/offer support to users. We may process your information to respond to your
                inquiries and solve any potential issues you might have with the requested service.
              </li>
              <li>
                To enable user-to-user communications. We may process your information if you choose to use any of our
                offerings that allow for communication with another user.
              </li>
              <li>
                To request feedback. We may process your information when necessary to request feedback and to contact
                you about your use of our Services.
              </li>
            </ul>
          </section>

          <section id="section3">
            <h2 className="text-2xl font-semibold mb-4">
              3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </h2>
            <p className="mb-4">
              <em>
                In Short: We may share information in specific situations described in this section and/or with the
                following third parties.
              </em>
            </p>
            <p className="mb-4">We may need to share your personal information in the following situations:</p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Business Transfers. We may share or transfer your information in connection with, or during negotiations
                of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to
                another company.
              </li>
            </ul>
          </section>

          <section id="section4">
            <h2 className="text-2xl font-semibold mb-4">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
            <p className="mb-4">
              <em>
                In Short: We may use cookies and other tracking technologies to collect and store your information.
              </em>
            </p>
            <p className="mb-4">
              We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information
              when you interact with our Services. Some online tracking technologies help us maintain the security of
              our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic
              site functions.
            </p>
            <p className="mb-4">
              We also permit third parties and service providers to use online tracking technologies on our Services for
              analytics and advertising, including to help manage and display advertisements, to tailor advertisements
              to your interests, or to send abandoned shopping cart reminders (depending on your communication
              preferences). The third parties and service providers use their technology to provide advertising about
              products and services tailored to your interests which may appear either on our Services or on other
              websites.
            </p>
            <p className="mb-4">
              To the extent these online tracking technologies are deemed to be a &quot;sale&quot;/&quot;sharing&quot; (which includes
              targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt
              out of these online tracking technologies by submitting a request as described below under section &quot;DO
              UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?&quot;
            </p>
            <p className="mb-4">
              Specific information about how we use such technologies and how you can refuse certain cookies is set out
              in our Cookie Notice: http://www.poppacare.com/cookies.
            </p>
          </section>

          <section id="section5">
            <h2 className="text-2xl font-semibold mb-4">5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
            <p className="mb-4">
              <em>
                In Short: We offer products, features, or tools powered by artificial intelligence, machine learning, or
                similar technologies.
              </em>
            </p>
            <p className="mb-4">
              As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine
              learning, or similar technologies (collectively, &quot;AI Products&quot;). These tools are designed to enhance your
              experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of
              the AI Products within our Services.
            </p>
            <h3 className="text-xl font-semibold mb-2">Use of AI Technologies</h3>
            <p className="mb-4">
              We provide the AI Products through third-party service providers (&quot;AI Service Providers&quot;), including
              OpenAI. As outlined in this Privacy Notice, your input, output, and personal information will be shared
              with and processed by these AI Service Providers to enable your use of our AI Products for purposes
              outlined in &quot;WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?&quot; You must not use the AI Products
              in any way that violates the terms or policies of any AI Service Provider.
            </p>
            <h3 className="text-xl font-semibold mb-2">Our AI Products</h3>
            <p className="mb-4">Our AI Products are designed for the following functions:</p>
            <ul className="list-disc list-inside mb-4">
              <li>AI automation</li>
              <li>AI bots</li>
              <li>Image analysis</li>
              <li>Text analysis</li>
              <li>AI development</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2">How We Process Your Data Using AI</h3>
            <p className="mb-4">
              All personal information processed using our AI Products is handled in line with our Privacy Notice and
              our agreement with third parties. This ensures high security and safeguards your personal information
              throughout the process, giving you peace of mind about your data&apos;s safety.
            </p>
          </section>

          <section id="section6">
            <h2 className="text-2xl font-semibold mb-4">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
            <p className="mb-4">
              <em>
                In Short: If you choose to register or log in to our Services using a social media account, we may have
                access to certain information about you.
              </em>
            </p>
            <p className="mb-4">
              Our Services offer you the ability to register and log in using your third-party social media account
              details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile
              information about you from your social media provider. The profile information we receive may vary
              depending on the social media provider concerned, but will often include your name, email address, friends
              list, and profile picture, as well as other information you choose to make public on such a social media
              platform.
            </p>
            <p className="mb-4">
              If you log in using Facebook, we may also request access to other permissions related to your account,
              such as friends, check-ins, and likes, and you may choose to grant or deny us access to each individual
              permission.
            </p>
            <p className="mb-4">
              We will use the information we receive only for the purposes that are described in this Privacy Notice or
              that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are
              not responsible for, other uses of your personal information by your third-party social media provider. We
              recommend that you review their privacy notice to understand how they collect, use, and share your
              personal information, and how you can set your privacy preferences on their sites and apps.
            </p>
          </section>

          <section id="section7">
            <h2 className="text-2xl font-semibold mb-4">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
            <p className="mb-4">
              <em>
                In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this
                Privacy Notice unless otherwise required by law.
              </em>
            </p>
            <p className="mb-4">
              We will only keep your personal information for as long as it is necessary for the purposes set out in
              this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax,
              accounting, or other legal requirements). No purpose in this notice will require us keeping your personal
              information for longer than the period of time in which users have an account with us.
            </p>
            <p className="mb-4">
              When we have no ongoing legitimate business need to process your personal information, we will either
              delete or anonymize such information, or, if this is not possible (for example, because your personal
              information has been stored in backup archives), then we will securely store your personal information and
              isolate it from any further processing until deletion is possible.
            </p>
          </section>

          <section id="section8">
            <h2 className="text-2xl font-semibold mb-4">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
            <p className="mb-4">
              <em>
                In Short: We aim to protect your personal information through a system of organizational and technical
                security measures.
              </em>
            </p>
            <p className="mb-4">
              We have implemented appropriate and reasonable technical and organizational security measures designed to
              protect the security of any personal information we process. However, despite our safeguards and efforts
              to secure your information, no electronic transmission over the Internet or information storage technology
              can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or
              other unauthorized third parties will not be able to defeat our security and improperly collect, access,
              steal, or modify your information. Although we will do our best to protect your personal information,
              transmission of personal information to and from our Services is at your own risk. You should only access
              the Services within a secure environment.
            </p>
          </section>

          <section id="section9">
            <h2 className="text-2xl font-semibold mb-4">9. DO WE COLLECT INFORMATION FROM MINORS?</h2>
            <p className="mb-4">
              <em>In Short: We do not knowingly collect data from or market to children under 18 years of age.</em>
            </p>
            <p className="mb-4">
              We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we
              knowingly sell such personal information. By using the Services, you represent that you are at least 18 or
              that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the
              Services. If we learn that personal information from users less than 18 years of age has been collected,
              we will deactivate the account and take reasonable measures to promptly delete such data from our records.
              If you become aware of any data we may have collected from children under age 18, please contact us at
              info@poppa.ai.
            </p>
          </section>

          <section id="section10">
            <h2 className="text-2xl font-semibold mb-4">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
            <p className="mb-4">
              <em>
                In Short: In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada,
                you have rights that allow you greater access to and control over your personal information. You may
                review, change, or terminate your account at any time.
              </em>
            </p>
            <p className="mb-4">
              In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection
              laws. These may include the right (i) to request access and obtain a copy of your personal information,
              (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information;
              and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to
              object to the processing of your personal information. You can make such a request by contacting us by
              using the contact details provided in the section &quot;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&quot; below.
            </p>
            <p className="mb-4">
              To the extent that applicable law requires, we will grant individuals the rights concerning their personal
              information as described above.
            </p>
          </section>

          <section id="section11">
            <h2 className="text-2xl font-semibold mb-4">11. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
            <p className="mb-4">
              Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&quot;DNT&quot;)
              feature or setting you can activate to signal your privacy preference not to have data about your online
              browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing
              and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser
              signals or any other mechanism that automatically communicates your choice not to be tracked online. If a
              standard for online tracking is adopted that we must follow in the future, we will inform you about that
              practice in a revised version of this Privacy Notice.
            </p>
          </section>

          <section id="section12">
            <h2 className="text-2xl font-semibold mb-4">12. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
            <p className="mb-4">
              <em>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.</em>
            </p>
            <p className="mb-4">
              We may update this Privacy Notice from time to time. The updated version will be indicated by an updated
              &quot;Revised&quot; date and the updated version will be effective as soon as it is accessible. If we make material
              changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes
              or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be
              informed of how we are protecting your information.
            </p>
          </section>

          <section id="section13">
            <h2 className="text-2xl font-semibold mb-4">13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
            <p className="mb-4">
              If you have questions or comments about this notice, you may email us at info@poppacare.com or by post to:
            </p>
            <p className="mb-4">
              19790 W Dixie Hwy, #1207, Aventura, FL 33180
              <br />
              <br />
              United States of America
            </p>
          </section>

          <section id="section14">
            <h2 className="text-2xl font-semibold mb-4">
              14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
            </h2>
            <p className="mb-4">
              Based on the applicable laws of your country, you may have the right to request access to the personal
              information we collect from you, change that information, or delete it in some circumstances. To request
              to review, update, or delete your personal information, please visit: http://www.poppacare.com/ToS or
              write us at:
            </p>
            <p className="mb-4">
              Poppa Services Inc.
              <br />
              ATTN: Legal Team
              <br />
              19790 W Dixie Hwy, #1207, Aventura, FL 33180
              <br />
              United States of America
            </p>
          </section>
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

