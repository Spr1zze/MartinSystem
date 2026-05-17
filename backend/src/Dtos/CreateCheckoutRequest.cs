
namespace Backend.Dtos
{
    public class CreateCheckoutRequest
    {
        public int ItemId { get; set; }
        public int StudentId { get; set; }
        public int QuantityTaken { get; set; }
        public string Signature { get; set; }
    }
}
