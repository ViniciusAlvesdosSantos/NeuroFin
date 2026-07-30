import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany()
  console.log(users.map(u => ({ email: u.email, isEmailVerified: u.isEmailVerified, status: u.status })))
}
main()
