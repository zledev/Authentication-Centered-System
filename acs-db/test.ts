import { Role } from "./generated/prisma/enums";
import { prisma } from "./lib/prisma";

async function main() {
	const user = await prisma.user.create({
		data: {
			id: "real",
			email: "real@gmail.com",
			password: "real123456",
			role: Role.ADMIN,
			createdAt: new Date(),
		},
	});

	console.log("Created User:", user);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});