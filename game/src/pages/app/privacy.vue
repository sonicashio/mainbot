<script lang="ts" setup>
definePageMeta({
    layout: "app-logged-in",
});
</script>

<template>
  <section class="flex flex-col grow mx-2">
    <div class="flex flex-col my-8">
      <span class="text-3xl font-extrabold text-center text-yellow-300 pb-1">Welcome to Sonicash!</span>
      <p class="text-center">
        Your privacy is important to us.
        This Privacy Policy outlines how we collect, use, disclose, and protect your information when you use Sonicash
        ("we," "our," or "us").
      </p>
    </div>

    <div>
      <h2>
        <div
          class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          rounded-t-xl focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
        >
          <span class="flex items-center">
            Information We Collect
          </span>
        </div>
      </h2>

      <div>
        <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
          <p class="mb-2 text-gray-400">
            <span class="font-bold">Personal Information:</span><br />
            Telegram Username: To identify and interact with you within the bot.<br />
            Contact Information: Such as email or phone number, if voluntarily provided for support or feedback.<br />
            Profile Information: Any profile information you share publicly on Telegram accessible to us through the bot.<br />
          </p>
          <p class="text-gray-400">
            <span class="font-bold">Non-Personal Information:</span><br />
            Usage Data: Information about your interactions with the bot, including time of use, features accessed,
            and other usage data.<br />
            Device Information: Information about the device you use to access the bot, such as operating system,
            hardware model, and unique device identifiers.<br />
          </p>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              How We Use Your Information
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              Providing and Maintaining the Service: To operate the bot and provide its features.<br />
              Improving the Service: To understand how you use the bot and improve its performance.<br />
              Communication: To respond to inquiries, provide updates, and offer support.<br />
              Ensuring Security: To detect, prevent, and address technical issues or misuse.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Information Sharing and Disclosure
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              With Your Consent: We may share your information with third parties with your explicit consent.<br />
              Service Providers: We may work with third-party providers to facilitate services, who will only access your information
              to perform tasks on our behalf.<br />
              Legal Requirements: We may disclose information if required by law or in response to valid legal requests.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Data Security
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              We implement measures to protect your information from unauthorized access or disclosure. However,
              no method of transmission over the internet is 100% secure.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Your Rights
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              Access and Update: You can request access to or update your personal information.<br />
              Deletion: You can request the deletion of your data, subject to legal obligations.<br />
              Object: You can object to the processing of your data.<br />
              Withdraw Consent: You can withdraw your consent at any time.<br />
              To exercise these rights, contact us.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Children's Privacy
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              Sonicash is not intended for children under the age of 13.<br />
              We do not knowingly collect information from children under 13.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Coin Listing
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              Sonicash will launch its own coin as part of the rewards system.<br />
              The coin will be listed on exchanges once we reach a minimum of 2 million users.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Changes to the Policy
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40">
            <p class="mb-2 text-gray-400">
              We may update this policy from time to time.<br />
              Any changes will be posted here, and you are advised to review the policy periodically.<br />
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2>
          <div
            class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0
          focus:ring-4 focus:ring-gray-800 border-gray-700 text-gray-400 gap-3 select-none"
          >
            <span class="flex items-center">
              Contact Us
            </span>
          </div>
        </h2>

        <div>
          <div class="p-5 border border-b-0 border-gray-700 bg-black/40 rounded-b-2xl">
            <p class="mb-2 text-gray-400">
              If you have any questions, feel free to reach out to us at
              <a
                class="text-blue-500"
                href="mailto:contact@sonicash.io"
              >contact@sonicash.io</a><br />
              We aim to respond within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="h-24" />
  </section>
</template>

<style>

</style>
