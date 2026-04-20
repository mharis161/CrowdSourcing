import bcrypt from 'bcryptjs';
import prisma from './lib/prisma.js';

async function resetPassword() {
  try {
    const user = await prisma.user.findFirst({ where: { email: { contains: 'haris@gmail' } } });
    if (!user) {
      console.log('User not found!');
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('abc@123', salt);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    console.log('Password updated successfully to abc@123 for ' + user.email);
  } catch (err) {
    console.log('ERROR:', err.message);
  }
}

resetPassword().catch(console.error).finally(() => prisma.$disconnect());
