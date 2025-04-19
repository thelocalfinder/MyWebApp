namespace MyWebApp.Models
{
    public class SubCategory
    {
        public int ID { get; set; }
        public required string Name { get; set; }
        public int CategoryID { get; set; }
        public Category Category { get; set; } = null!;
    }
}
