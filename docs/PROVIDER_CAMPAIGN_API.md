# Provider and Campaign API Documentation

## Provider Endpoints

### Create Provider

`POST /providers`

```json
{
  "name": "Local Food Bank",
  "description": "Provides food assistance to families in need",
  "categories": ["food", "emergency"],
  "eligibility": "Low-income families, seniors, disabled individuals",
  "address": "123 Main St, City, State",
  "latitude": 40.7128,
  "longitude": -74.006,
  "operatingHours": "Mon-Fri 9AM-5PM",
  "capacity": 100,
  "contactEmail": "contact@foodbank.org",
  "contactPhone": "+1-555-0123"
}
```

### Get All Providers (with filtering)

`GET /providers?category=food&location=City&capacity=50`

### Search Providers

`GET /providers/search?q=food bank`

### Get Provider by ID

`GET /providers/:id`

### Update Provider

`PATCH /providers/:id`

### Delete Provider

`DELETE /providers/:id`

## Campaign Endpoints

### Create Campaign

`POST /campaigns`

```json
{
  "title": "Holiday Food Drive",
  "description": "Collecting food donations for the holiday season",
  "category": "food",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "targetAmount": 10000,
  "volunteersNeeded": 20,
  "providerId": "provider-uuid-here"
}
```

### Get All Campaigns (with filtering)

`GET /campaigns?category=food&providerId=uuid&status=active`

### Get Campaigns by Provider

`GET /campaigns/provider/:providerId`

### Get Campaign by ID

`GET /campaigns/:id`

### Update Campaign

`PATCH /campaigns/:id`

### Delete Campaign

`DELETE /campaigns/:id`

## Filter Parameters

### Provider Filters

- `category`: Filter by category (e.g., "food", "shelter", "medical")
- `location`: Filter by location (partial address match)
- `capacity`: Minimum capacity required

### Campaign Filters

- `category`: Filter by campaign category
- `providerId`: Filter by specific provider
- `status`: Filter by campaign status (active, completed, cancelled)
