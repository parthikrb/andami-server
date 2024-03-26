import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const designations = [
    'CEO',
    'CTO',
    'COO',
    'CFO',
    'CMO',
    'VP of Engineering',
    'VP of Sales',
    'VP of Marketing',
    'Product Manager',
    'Project Manager',
    'Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Fullstack Engineer',
    'Sr. Software Engineer',
    'Lead Software Engineer',
    'Principal Software Engineer',
    'Staff Software Engineer',
    'Sr. Frontend Engineer',
    'Sr. Backend Engineer',
    'Sr. Fullstack Engineer',
    'Lead Frontend Engineer',
    'Lead Backend Engineer',
    'Lead Fullstack Engineer',
    'Principal Frontend Engineer',
    'Principal Backend Engineer',
    'Principal Fullstack Engineer',
    'Staff Frontend Engineer',
    'Staff Backend Engineer',
    'Staff Fullstack Engineer',
    'Mobile Engineer',
    'QA Engineer',
    'DevOps Engineer',
    'SRE',
    'Engineering Manager',
    'Designer',
    'Product Designer',
    'UX Designer',
    'UI Designer',
    'Sr. Designer',
    'Data Scientist',
    'UX/UI Designer',
    'Marketing Specialist',
    'Sales Representative',
    'Customer Support Specialist',
    'HR Manager',
    'Finance Manager',
    'Content Writer',
    'Ops Manager',
    'Recruiter',
    'Ops Executive',
    'Content Manager',
    'Content Executive',
    'Content Specialist',
    'Content Strategist',
  ];

  const departments = [
    'Executive',
    'Engineering',
    'Sales',
    'Marketing',
    'Customer Support',
    'Human Resources',
    'Finance',
    'Product',
    'Design',
    'Data Science',
  ];

  const roles = ['Admin', 'Manager', 'Employee'];

  const permissions = [
    'create_user',
    'read_user',
    'update_user',
    'delete_user',
    'create_team',
    'read_team',
    'update_team',
    'delete_team',
    'create_sense',
    'read_sense',
    'update_sense',
    'delete_sense',
    'create_initiative',
    'read_initiative',
    'update_initiative',
    'delete_initiative',
    'create_question',
    'read_question',
    'update_question',
    'delete_question',
    'read_dashboard',
    'update_organization',
  ].map((name) => ({ name }));

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {},
      create: permission,
    });
  }

  const rolesWithPermissions = [
    {
      name: 'Admin',
      permissions: permissions, // Admin has all permissions
    },
    {
      name: 'Manager',
      permissions: [
        'create_user',
        'read_user',
        'update_user',
        'delete_user',
        'create_sense',
        'read_sense',
        'update_sense',
        'delete_sense',
        'create_initiative',
        'read_initiative',
        'update_initiative',
        'delete_initiative',
        'read_team',
        'update_team',
        'read_dashboard',
      ].map((name) => ({ name })),
    },
    {
      name: 'Employee',
      permissions: [
        'read_user',
        'read_sense',
        'read_initiative',
        'read_team',
        'read_dashboard',
      ].map((name) => ({ name })),
    },
  ];

  for (const { name, permissions } of rolesWithPermissions) {
    await prisma.role.upsert({
      where: {
        name,
      },
      update: {
        permissions: {
          set: permissions,
        },
      },
      create: {
        name,
        permissions: {
          connect: permissions,
        },
      },
    });
  }

  for (const title of designations) {
    await prisma.designation.upsert({
      where: {
        title,
      },
      update: {},
      create: {
        title,
      },
    });
  }

  for (const name of departments) {
    await prisma.department.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }

  for (const name of roles) {
    await prisma.role.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
