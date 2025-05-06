pass dev : C1vWpiS90zZWkXMs

supabase gen types typescript --project-id iblcxviqmqiutjzxnblx > ./types/database.types.ts
----
kolom location
update cafes
set location = st_point(replace(longitude, ',', '')::decimal, replace(latitude, ',', '')::decimal)
where longitude is not null;
----

select id, name, description, st_y(location::geometry) as lat, st_x(location::geometry) as long
, st_distance(location, st_point(107.59655891385863, -6.879245721118651)::geography) as dist_meters
  from public.cafes
  where st_distance(location, st_point(107.59655891385863, -6.879245721118651)::geography) < 5000
  order by location <-> st_point(107.59655891385863, -6.879245721118651)::geography;


-- create database function to find nearby stores

select id, name, description, st_y(location::geometry) as lat, st_x(location::geometry) as long
, st_distance(location, st_point(107.59655891385863, -6.879245721118651)::geography) as dist_meters
  from public.cafes
  where st_distance(location, st_point(107.59655891385863, -6.879245721118651)::geography) < 5000
  order by location <-> st_point(107.59655891385863, -6.879245721118651)::geography;

  select id, name, description, st_y(location::geometry) as lat, st_x(location::geometry) as long, location
  , st_distance(location, st_point(st_x(location::geometry), st_y(location::geometry))::geography) as dist_meters
  from public.stores
  order by location <-> st_point(st_x(location::geometry), st_y(location::geometry))::geography;


-- add some dummy data
insert into public.stores
  (name, description, location)
values
  (
    'The Galaxies.dev Shop',
    'Galaxies.dev - your favourite place to learn',
    st_point(7.6005702, 51.8807174)
  ),
  ('The Local Dev', 'Local people, always best', st_point(7.614454, 51.876565)),
  ('City Store', 'Get the supplies a dev needs', st_point(7.642581, 51.945606)),
  ('MEGA Store', 'Everything you need', st_point(13.404315, 52.511640));

update cafes
set location = st_point(replace(longitude, ',', '')::decimal, replace(latitude, ',', '')::decimal)
where longitude is not null;


select location, latitude, longitude, replace(latitude, ',', '')::decimal
from cafes


create schema if not exists "gis";
-- Example: enable the "postgis" extension
create extension postgis with schema "gis";


create index cafes_geo_index
  on public.cafes
  using GIST (location);

select name, site, phone, full_address, borough, street, city, postal_code
, state, latitude, longitude, time_zone, rating, photo, working_hours, about,
  logo
from cafes;
Select location_link
Select Lat ,long, city_slug, slug_name