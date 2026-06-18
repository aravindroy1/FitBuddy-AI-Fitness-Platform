resource "azurerm_cognitive_account" "openai" {
  name                = "openai-fitbuddy-${random_pet.suffix.id}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"

  custom_subdomain_name = "openai-fitbuddy-${random_pet.suffix.id}"
}

resource "azurerm_cognitive_deployment" "gpt4" {
  name                 = "gpt-4"
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    format  = "OpenAI"
    name    = "gpt-4"
    version = "0613"
  }
  
  scale {
    type = "Standard"
  }
}

resource "azurerm_search_service" "search" {
  name                = "search-fitbuddy-${random_pet.suffix.id}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "standard"
  partition_count     = 1
  replica_count       = 1
}
