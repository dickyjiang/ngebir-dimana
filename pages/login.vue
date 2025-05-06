<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Welcome Back</h1>
      <p class="subtitle">Sign in to your account</p>

      <div class="auth-buttons">
        <button
          class="google-button"
          @click="signInWithGoogle"
          :disabled="loading"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          {{ loading ? 'Signing in...' : 'Sign in with Google' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useSupabaseClient } from '#imports';

  const router = useRouter();
  const supabase = useSupabaseClient();
  const loading = ref(false);

  const signInWithGoogle = async () => {
    try {
      loading.value = true;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Error signing in with Google');
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 1rem;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .auth-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .google-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .google-button:hover {
    background-color: #f5f5f5;
  }

  .google-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .google-button img {
    width: 20px;
    height: 20px;
  }
</style>
