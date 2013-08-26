create table "Items"(item_id varchar(30), country_of_origin varchar(10), description varchar(40), cost real, image_url varchar(60));
/* Sequelize creates a default table from model - appending id, createdAt, updatedAt */
insert into "Items" values('HP001', 'India', 'Himanchali Topi', 10.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('HP002', 'India', 'Kullu Topi', 11.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('IS001', 'Turkey', 'Istanabul Topi', 12.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('IS002', 'Turkey', 'Basic Cap', 10.99,  '?', DEFAULT, current_date, current_date);
insert into "Items" values('PR001', 'Peru', 'Inca Cap', 15.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('PR002', 'Peru', 'Peruvian Cap', 12.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('AF001', 'Morocco', 'Fez', 10.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('AF002', 'Morocco', 'Deluxe Fez', 13.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('AF003', 'Morocco', 'Blue Fez', 12.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('SC001', 'Scotland', 'Green Tam', 9.99, '?', DEFAULT, current_date, current_date);
insert into "Items" values('SC002', 'Scotland', 'Red Tam', 9.99, '?', DEFAULT, current_date, current_date);
