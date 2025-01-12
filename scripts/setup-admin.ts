import { initializeAdminUser } from '../src/lib/firestore';

const email = 'maxkmurphy@gmail.com';

async function main() {
  try {
    await initializeAdminUser(email);
    console.log(`Successfully set up admin user: ${email}`);
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

main(); 