import java.util.Scanner;

public class E_ControlLogic {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);
        System.out.print("How much does it cost? $");
        float price = scanner.nextFloat();

        // Add tax -_-
        price += (price * 0.04F);

        if(price > 12.00F) {
            System.out.println("I don't think you should buy it");
        } else if(price > 5.00F) {
            System.out.println("Buy it");
        } else {
            System.out.println("Practically free");
        }

    }

}
