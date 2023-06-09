create table if not exists role_lookup (
    id serial primary key,
    name varchar (255) not null unique,
    description varchar (255) not null
);

create table if not exists "user" (
    id serial primary key,
    username varchar (255) not null unique,
    password varchar (255) not null,
    email varchar (255) not null unique,
    created_at timestamp default now(),
    updated_at timestamp default now(),
    role integer default 1,
    foreign key(role) references role_lookup(id)
);

create table if not exists tracker (
    id serial primary key
);


-- Lines 10 && 11 Now both have to be unique. Postgres will throw an error if you try to insert rows with duplicate values